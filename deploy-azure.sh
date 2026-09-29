#!/usr/bin/env bash
# Deploy The Syte to an Azure Storage static website.
# Usage: ./deploy-azure.sh [storageName] [resourceGroup] [location]
set -euo pipefail

NAME="${1:-thesyte$RANDOM}"
GROUP="${2:-the-syte-rg}"
LOC="${3:-canadacentral}"
HERE="$(cd "$(dirname "$0")" && pwd)"

az account show >/dev/null

az group create --name "$GROUP" --location "$LOC" >/dev/null

az storage account create \
  --name "$NAME" \
  --resource-group "$GROUP" \
  --location "$LOC" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --allow-blob-public-access true >/dev/null

az storage blob service-properties update \
  --account-name "$NAME" \
  --static-website \
  --index-document index.html \
  --404-document 404.html >/dev/null

az storage blob upload-batch \
  --account-name "$NAME" \
  --destination '$web' \
  --source "$HERE" \
  --overwrite >/dev/null

URL=$(az storage account show \
  --name "$NAME" \
  --resource-group "$GROUP" \
  --query "primaryEndpoints.web" -o tsv)

echo "Live desk: $URL"
