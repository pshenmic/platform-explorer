// Infinitely running function with a custom timeout delay
class Worker {
    constructor() {
        this.handler = null;
        this.running = false;
    }

    start(timeout) {
        this.running = true;

        setImmediate(async () => {
            while (this.running) {
                await this.handler()
                await new Promise((res) => setTimeout(res, timeout));
            }
        })
    }

    stop() {
        this.running = false
    }

    setHandler(func) {
        this.handler = func
    }
}

module.exports = Worker

