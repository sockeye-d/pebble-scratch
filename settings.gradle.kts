enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

plugins {
    kotlin("multiplatform") version "2.4.0" apply false
}

rootProject.name = "pebble-scratch"

include(":pkjs")
include(":backend")
