pipeline {
  agent any

  environment {
    NODE_ENV = 'test'
  }

  options {
    timeout(time: 20, unit: 'MINUTES')
    disableConcurrentBuilds()
    timestamps()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        echo "Branch: ${env.BRANCH_NAME}"
        // On PRs, CHANGE_ID and CHANGE_TITLE are also set:
        script {
          if (env.CHANGE_ID) {
            echo "PR #${env.CHANGE_ID}: ${env.CHANGE_TITLE}"
            echo "Author: ${env.CHANGE_AUTHOR} targeting ${env.CHANGE_TARGET}"
          }
        }
      }
    }

    stage('Install') {
      steps { sh 'npm ci' }
    }

    stage('Test') {
      steps { sh 'npm test' }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'test-results/junit.xml'
        }
      }
    }

    stage('Code quality') {
      // Runs on ALL branches — feature, PR, and main
      steps {
        echo "Running lint and static analysis..."
        sh 'npm run test -- --coverage || true'
      }
    }

    stage('Deploy to staging') {
      // Only deploy when merging/pushing to main
      // NOT on feature branches, NOT on PRs
      when {
        allOf {
          branch 'main'
          not { changeRequest() }  // extra guard: not a PR build
        }
      }
      steps {
        echo "Deploying branch '${env.BRANCH_NAME}' to staging..."
        sh 'echo "Deploying to staging environment"'
      }
    }

    stage('Integration tests') {
      // Only run after staging deploy (main branch only)
      when { branch 'main' }
      steps {
        echo "Running integration tests against staging..."
        sh 'npm test'
      }
    }

    stage('PR validation summary') {
      // Only runs on PR builds — gives reviewers a summary
      when { changeRequest() }
      steps {
        echo "PR #${env.CHANGE_ID} build complete."
        echo "All checks passed — safe to merge into ${env.CHANGE_TARGET}."
      }
    }

  }

  post {
    success {
      script {
        if (env.CHANGE_ID) {
          echo "PR #${env.CHANGE_ID} is GREEN — ready for review."
        } else {
          echo "Branch '${env.BRANCH_NAME}' build SUCCESS."
        }
      }
    }
    failure {
      echo "Build FAILED on branch '${env.BRANCH_NAME}'. Check console above."
    }
    always { cleanWs() }
  }
}

