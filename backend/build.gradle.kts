plugins {
    kotlin("multiplatform") apply true
}

group = "dev.fishies.pebble_scratch"
version = "unspecified"

repositories {
    mavenCentral()
}

kotlin {
    jvm()
    sourceSets.commonMain {
        resources.srcDir(layout.buildDirectory.dir("processedResources/commonMain"))
        dependencies {
            implementation(libs.bundles.ktor.server)
        }
    }
    sourceSets.commonTest.dependencies {
        implementation(libs.bundles.ktor.server.test)
    }
}

val compileConfigPage = tasks.register<Exec>("compileConfigPage") {
    description = "Compile static config-page"
    val configPageDir = project.rootDir.resolve("config-page")
    workingDir = configPageDir
    inputs.dir(configPageDir.resolve("src"))
    inputs.file(configPageDir.resolve("package.json"))
    inputs.file(configPageDir.resolve("package-lock.json"))
    inputs.file(configPageDir.resolve("tsconfig.json"))
    inputs.file(configPageDir.resolve("webpack.config.js"))
    outputs.file(configPageDir.resolve("dist/bundle.js"))
    outputs.file(configPageDir.resolve("dist/index.html"))
    commandLine = listOf("npm", "run", "build-devel")
}

val copyConfigPage = tasks.register<Copy>("copyConfigPage") {
    description = "Copy static config-page"
    dependsOn(compileConfigPage)
    from(listOf("bundle.js", "index.html").map { project.rootDir.resolve("config-page/dist/$it") })
    into(layout.buildDirectory.dir("processedResources/commonMain/static"))
}

tasks.named("jvmProcessResources") {
    dependsOn(copyConfigPage)
}
