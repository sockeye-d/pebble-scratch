import java.util.Properties

val assemblePebbleApp = tasks.register<Exec>("assemblePebbleApp") {
    description = "Runs `pebble build`"
    dependsOn(":pkjs:assemble")
    inputs.dir(project.projectDir.resolve("src/c"))
    commandLine = listOf("pebble", "build")
}

val props = Properties().apply {
    load(project.projectDir.resolve("local.properties").inputStream())
}

val phoneIp = props["install.ip"]
if (phoneIp is String) {
    val installPebbleApp = tasks.register<Exec>("installPebbleApp") {
        description = "Runs `pebble install --phone <install.ip>`"
        dependsOn(assemblePebbleApp)
        commandLine = listOf("pebble", "install", "--phone", phoneIp)
    }
}
