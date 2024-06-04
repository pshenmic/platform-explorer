function getSkip() {
    // skipSynchronizationBeforeHeight
    if (process.env.skipSynchronizationBeforeHeight
        && process.env.skipSynchronizationBeforeHeight.toString().replace(' ', '') !== ""
    ) {
        return parseInt(process.env.skipSynchronizationBeforeHeight);
    } else {
        throw new Error('skipSynchronizationBeforeHeight is not set');
    }
}