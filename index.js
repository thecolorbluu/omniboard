const { spawn } = require("child_process");

function launch() {
    const bot = spawn(process.execPath, ["bot.js"], {
        stdio: "inherit"
    });

    bot.on("exit", (code) => {
        if (code === 0) {
            console.log("Bot terminated expectedly");
        } else {
            console.log("Bot terminated unexpectedly, restarting.");
            setTimeout(launch, 1000);
        }
    })
}

console.log("Initial startup");
launch();