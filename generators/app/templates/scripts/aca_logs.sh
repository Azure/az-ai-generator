#!/usr/bin/env bash
set -euo pipefail # exit on error, undefined variable, and error in pipeline
[ -n "${DEBUG:-}" ] && set -x # enable debug mode if DEBUG is set

if [ "$#" -lt "1" ]; then
    printf "Usage: $0 <backend|frontend>\n"
    exit 1
fi

service="$1"
if [[ "$service" != "backend" && "$service" != "frontend" ]]; then
    printf "Invalid argument: '$service'. Expected 'backend' or 'frontend'.\n"
    exit 1
fi

resource_group_name="$(azd env get-value AZURE_RESOURCE_GROUP)"
if [ -z "$resource_group_name" ]; then
    printf "Resource group name not found in AZD environment variable AZURE_RESOURCE_GROUP\n"
    exit 1
fi

containerapp_name="$(
    az containerapp list \
        --resource-group "${resource_group_name}" \
        --query "[?contains(name, '${service}')].name" \
         --output tsv)"

az containerapp logs show \
    --resource-group "${resource_group_name}" \
    --name "${containerapp_name}" \
    --container main \
    --type console \
    --follow "${@:2}"
