plugins {
    kotlin("multiplatform") version "2.3.21"
}

kotlin {
    js {
        browser {
            binaries.library()
            webpackTask {
                mainOutputFileName = "pkjs.js"
                output.library = "pkjs"
                output.libraryTarget = "commonjs"
            }
        }
    }
}
