pipeline {
  agent any

  environment {
    NODE_ENV = 'test'
    JUNIT_OUTPUT = 'test-results/junit.xml'
    // Gets version dynamically for the deploy messages
    APP_VERSION = sh(script: 'node -p "require(\'./package.json\').version"', returnStdout: true).trim()
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
        sh 'npm run test -- --listTests'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
      post {
        always {
          // Note: using double quotes so Groovy reads the variable
          junit allowEmptyResults: true, testResults: "${JUNIT_OUTPUT}"
        }
      }
    }

    stage('Archive results') {
      steps {
        archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
      }
    }

    stage('Deploy to staging') {
      when {
        branch 'main'
      }
      steps {
        echo "Deploying v${env.APP_VERSION} to staging..."
        sh 'echo "kubectl apply -f k8s/staging.yaml"' 
      }
    }

    stage('Deploy to production') {
      when {
        branch 'main'
      }
      steps {
        input message: "Deploy v${env.APP_VERSION} to PRODUCTION?", ok: "Deploy"
        echo "Deploying to production..."
        sh 'echo "kubectl apply -f k8s/prod.yaml"' 
      }
    }

  }

  post {
    success {
      echo "All stages passed! v${env.APP_VERSION} pipeline complete. Build #${env.BUILD_NUMBER} is GREEN."
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
