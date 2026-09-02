export function loadingStart(message: string){
  if (!process.stdout.isTTY) {
    return null
  }

  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;

  const timer = setInterval(() => {
    process.stdout.write(`\r${frames[i++ % frames.length]} ${message}`);
  }, 100);

  return timer
}

export function loadingEnd(timer: Timer | null, message: string){
  if (timer === null) {
    return
  }

  clearInterval(timer)
  process.stdout.clearLine(-1)
  process.stdout.write(`\r✓ ${message}`);
}
