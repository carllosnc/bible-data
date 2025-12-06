export function loadingStart(message: string){
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;

  const timer = setInterval(() => {
    process.stdout.write(`\r${frames[i++ % frames.length]} ${message}`);
  }, 100);

  return timer
}

export function loadingEnd(timer: Timer, message: string){
  clearInterval(timer)
  process.stdout.clearLine(-1)
  process.stdout.write(`\r✓ ${message}`);
}
