pipeline {
  agent {
    docker {
      image 'node:18'
      args '-u root:root'   // avoids permission issues when writing files
    }
  }

  environment {
    NODE_ENV = 'test'
    JUNIT_OUTPUT = 'test-results/junit.xml'
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
        echo "Repo: ${env.JOB_NAME} | Branch: ${env.GIT_BRANCH} | Build: #${env.BUILD_NUMBER}"
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        // Optional ESLint
        // sh 'npx eslint src/'

        sh 'npm run test -- --listTests'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: "${JUNIT_OUTPUT}"
        }
      }
    }

    stage('Archive results') {
      steps {
        archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
      }
    }

  }

  post {
    success {
      echo "All stages passed. Build #${env.BUILD_NUMBER} is GREEN."
    }
    failure {
      echo "Build #${env.BUILD_NUMBER} FAILED at stage: ${env.STAGE_NAME}"
    }
    unstable {
      echo "Build UNSTABLE — tests ran but some failed (check Test Results tab)"
    }
    always {
      echo "Duration: ${currentBuild.durationString}"
      cleanWs()
    }
  }
}
