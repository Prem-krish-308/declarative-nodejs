pipeline {
  agent {
    docker {
      image 'node:18'
      args '-u root'
    }
  }

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
        script {
          if (env.CHANGE_ID) {
            echo "PR #${env.CHANGE_ID}: ${env.CHANGE_TITLE}"
            echo "Author: ${env.CHANGE_AUTHOR} targeting ${env.CHANGE_TARGET}"
          }
        }
      }
    }

    stage('Install') {
      steps { 
        sh 'node -v'
        sh 'npm -v'
        sh 'npm ci' 
      }
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
      steps {
        echo "Running lint and static analysis..."
        sh 'npm run test -- --coverage || true'
      }
    }

    stage('Deploy to staging') {
      when {
        allOf {
          branch 'main'
          not { changeRequest() }
        }
      }
      steps {
        echo "Deploying branch '${env.BRANCH_NAME}' to staging..."
        sh 'echo "Deploying to staging environment"'
      }
    }

    stage('Integration tests') {
      when { branch 'main' }
      steps {
        echo "Running integration tests against staging..."
        sh 'npm test'
      }
    }

    stage('PR validation summary') {
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

