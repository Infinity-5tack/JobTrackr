variable "resource_group_name" {
  description = "The name of the resource group."
  type        = string
  default     = "JobTrackr-RG"
}

variable "location" {
  description = "Azure location."
  type        = string
  default     = "East US"
}

variable "acr_name" {
  description = "Name of the Azure Container Registry (must be globally unique)."
  type        = string
  default     = "jobtrackracr"
}

variable "aks_cluster_name" {
  description = "Name of the AKS cluster."
  type        = string
  default     = "jobtracker-aks"
}

variable "vm_admin_username" {
  description = "Admin username for the Virtual Machines."
  type        = string
  default     = "azureuser"
}

variable "mysql_server_name" {
  description = "Name of the Azure MySQL Flexible Server (must be globally unique)."
  type        = string
  default     = "jobtrackerfs"
}

variable "mysql_admin_user" {
  description = "MySQL admin username."
  type        = string
  default     = "mysqladmin"
}

variable "mysql_admin_password" {
  description = "MySQL admin password (store securely in production)."
  type        = string
  default     = "Indianbank12@"   # Replace with a secure value
}
