terraform {
  required_version = ">= 1.5.6"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.20.0"
    }
  }
  backend "local" {}
}

provider "azurerm" {
  subscription_id = "836e15ab-74eb-46ec-9bbb-900ea9d25489"
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}



