variable "hmac_secret" {
  description = "HMAC secret used to verify score submissions"
  type        = string
  sensitive   = true
}
