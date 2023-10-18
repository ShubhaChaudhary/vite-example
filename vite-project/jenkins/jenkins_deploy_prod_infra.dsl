folder("/apps/notes-web-app")
pipelineJob("/apps/notes-web-app/Deploy Infrastructure") {
  parameters {
    choiceParam(
      'ENVIRONMENT',
      ['local-uk', 'area-na', 'local-us', 'local-sbox'],
      'Environment to target'
    )
    choiceParam(
      'BRANCH_NAME',
      ['main'],
      'The branch to run from.'
    )
  }
  definition {
    cpsScm {
      scm {
        git {
          remote {
            url("https://github.com/DubberSoftware/notes-web-app.git")
            credentials('github-id')
          }
          branch("main")
        }
      }
      scriptPath('.jenkins/Jenkinsfile.deploy_infra')
    }
  }
  logRotator {
    numToKeep(20)
  }
}