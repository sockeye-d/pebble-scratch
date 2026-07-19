package dev.fishies.kpkjs

external interface WatchInfo {
    val platform: String
    val model: String
    val language: String
    val firmware: Firmware

    interface Firmware {
        val major: String
        val minor: String
        val patch: String
        val suffix: String
    }
}
