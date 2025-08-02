#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Check if the GOOGLE_APPLICATION_CREDENTIALS_JSON secret is set
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS_JSON" ]; then
  # Decode the base64 secret and write it to the file path specified by $GOOGLE_APPLICATION_CREDENTIALS
  echo "$GOOGLE_APPLICATION_CREDENTIALS_JSON" | base64 -d > "$GOOGLE_APPLICATION_CREDENTIALS"
  echo "Google Cloud credentials written to $GOOGLE_APPLICATION_CREDENTIALS"
else
  echo "GOOGLE_APPLICATION_CREDENTIALS_JSON not set. Skipping credentials file creation."
fi

# Execute the command passed as arguments to this script (e.g., the deno run command from fly.toml)
exec "$@"