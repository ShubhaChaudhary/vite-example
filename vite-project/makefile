ifdef ENV
export BACKEND_CLI=-backend-config=./state_backend/${ENV}.tfvars
else
export BACKEND_CLI=-backend=false
endif

all: help

.PHONY: help # generate list of targets with descriptions
help:
	@echo "**** Available actions ****"
	@grep '^.PHONY: .* #' Makefile | sed 's/\.PHONY: \(.*\) # \(.*\)/\1	: \2/' | expand -t15

.PHONY: tf-validate # Validate terraform cloud resources [ENV]
tf-validate:
	cd ./terraform \
		&& terraform validate

.PHONY: tf-init # Initialise terraform cloud resources [ENV]
tf-init:
	cd ./terraform \
		&& terraform init ${BACKEND_CLI}

.PHONY: tf-plan # Plan cloud resources update [ENV]
tf-plan:
	cd ./terraform \
		&& terraform plan -out plan.a -var-file=./values/${ENV}.tfvars

.PHONY: tf-apply # Apply cloud resources update
tf-apply:
	cd ./terraform \
		&& terraform apply plan.a

.PHONY: tf-destroy # Apply cloud resources update
tf-destroy:
	cd ./terraform \
		&& terraform destroy -var-file=./values/${ENV}.tfvars -auto-approve

.PHONY: chart-package # package Helm Chart
chart-package:
	@helm package charts/*

.PHONY: chart-publish # publish Helm Chart [CHARTS_USER,CHARTS_PASSWORD]
chart-publish:
	@echo Publishing API Helm Chart
	@ls *.tgz | xargs -I FILENAME curl --data-binary "@FILENAME" "https://${CHARTS_USER}:${CHARTS_PASSWORD}@chartmuseum.tools.littlekube.dubber.net/api/charts"

# frontend tasks
.PHONY: install # Install dependencies (fail if any not in yarn.lock)
install:
	yarn install --frozen-lockfile --non-interactive

.PHONY: lint # Lint code
lint:
	CI=true yarn lint

.PHONY: test # Run unit tests and generate coverage for CI
test:
	CI=true yarn test

security:
	yarn audit

.PHONY: build # Build all artifacts
build:
	REVISION=$(shell scripts/getRevision.sh) yarn build

.PHONY: package # Package artifacts after build
package:
	yarn package