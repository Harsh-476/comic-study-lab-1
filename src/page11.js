document.getElementById('file-input').addEventListener('change', function () {
  document.getElementById('file-name').textContent =
    this.files.length ? this.files[0].name : 'No file chosen';
});

document.getElementById('upload-btn').addEventListener('click', function () {
  const desc = document.getElementById('description').value.trim();

  if (!desc) {
    const ta = document.getElementById('description');
    ta.style.borderColor = '#c0392b';
    ta.focus();
    setTimeout(() => ta.style.borderColor = '', 1800);
    return;
  }

  const orig = this.textContent;
  this.textContent = 'UPLOADED ✓';
  this.style.cssText = 'background:#3d6b45;color:#fff;border-color:#3d6b45';

  setTimeout(() => {
    this.textContent = orig;
    this.style.cssText = '';
  }, 2500);
});
