[[ ! -z "$BUGSNAG_API_KEY" ]] && curl --http1.1 https://upload.bugsnag.com/ \
  -F apiKey=$BUGSNAG_API_KEY \
  -F minifiedUrl="$PUBLIC_PATH"bundle.js \
  -F sourceMap=@build/bundle.js.map \
  -F minifiedFile=@build/bundle.js \
  -F overwrite=true \
  -F "$PUBLIC_PATH"bundle.js=@build/bundle.js

[[ ! -z "$HONEYBADGER_API_KEY" ]] && curl https://api.honeybadger.io/v1/source_maps \
  -F api_key=$HONEYBADGER_API_KEY \
  -F minified_url="$PUBLIC_PATH"bundle.js \
  -F source_map=@build/bundle.js.map \
  -F minified_file=@build/bundle.js \
  -F revision=$GITHUB_VERSION \
  -F "$PUBLIC_PATH"bundle.js=@build/bundle.js

exit 0