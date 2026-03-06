terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket         = "ces-terraform-state-525944049491"
    key            = "chalke-fishing/prod/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "chalke-customs-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

# ── DynamoDB ──────────────────────────────────────────────────────────────────

resource "aws_dynamodb_table" "scores" {
  name         = "chalke-fishing-scores"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "gsiPk"
    type = "S"
  }

  attribute {
    name = "score"
    type = "N"
  }

  global_secondary_index {
    name            = "gsiPk-score-index"
    hash_key        = "gsiPk"
    range_key       = "score"
    projection_type = "ALL"
  }
}

# ── Lambda ────────────────────────────────────────────────────────────────────

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/index.js"
  output_path = "${path.module}/lambda/handler.zip"
}

resource "aws_iam_role" "lambda_exec" {
  name = "chalke-fishing-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "chalke-fishing-lambda-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem", "dynamodb:Query"]
        Resource = [
          aws_dynamodb_table.scores.arn,
          "${aws_dynamodb_table.scores.arn}/index/gsiPk-score-index",
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:*"
      },
    ]
  })
}

resource "aws_lambda_function" "scores" {
  function_name    = "chalke-fishing-scores"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  memory_size      = 128
  timeout          = 10
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      TABLE_NAME  = aws_dynamodb_table.scores.name
      HMAC_SECRET = var.hmac_secret
    }
  }
}

# ── API Gateway HTTP v2 ───────────────────────────────────────────────────────

resource "aws_apigatewayv2_api" "scores" {
  name          = "chalke-fishing-scores-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_integration" "scores" {
  api_id                 = aws_apigatewayv2_api.scores.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.scores.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_scores" {
  api_id    = aws_apigatewayv2_api.scores.id
  route_key = "GET /scores"
  target    = "integrations/${aws_apigatewayv2_integration.scores.id}"
}

resource "aws_apigatewayv2_route" "post_scores" {
  api_id    = aws_apigatewayv2_api.scores.id
  route_key = "POST /scores"
  target    = "integrations/${aws_apigatewayv2_integration.scores.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.scores.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scores.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.scores.execution_arn}/*/*"
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "api_url" {
  value = aws_apigatewayv2_stage.default.invoke_url
}
