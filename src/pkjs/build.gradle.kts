import groovy.json.JsonSlurper

plugins {
    kotlin("multiplatform") version "2.3.21"
}

val generatedSrc = project.layout.buildDirectory.dir("src/commonMain/kotlin")

kotlin {
    sourceSets.commonMain {
        kotlin.srcDir(generatedSrc)
    }
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

val generateMessageKeys = tasks.register("generateMessageKeys") {
    description = "Generates message keys from package.json"
    val packageJsonFile = project.rootDir.resolve("package.json")
    val output = generatedSrc.get().file("dev/fishies/kpkjs/gen/MessageKeys.kt").asFile
    inputs.file(packageJsonFile)
    outputs.file(output)
    doLast {
        val packageJson = JsonSlurper().parse(packageJsonFile) as Map<*, *>
        val inner =
            ((packageJson["pebble"] as Map<*, *>)["messageKeys"] as List<*>).joinToString("\n") { "const val $it: String = \"\"\"$it\"\"\"" }
        output.writeText(
            """
            package dev.fishies.kpkjs.gen
            
            object MessageKeys {
${inner.prependIndent("                ")}
            }
            
""".trimIndent()
        )
    }
}

tasks.named("compileKotlinJs") {
    dependsOn(generateMessageKeys)
}
