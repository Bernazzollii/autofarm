const toastEl = document.querySelector('.toast');

function showToast(msg, type) {
    switch (type) {
        case 'danger':
            toastEl.classList.add('bg-danger');
            break;

        case 'warning':
            toastEl.classList.add('bg-warning');
            break;
        case 'success':
            toastEl.classList.add('bg-success');
            break;
        default:
            toastEl.classList.add('bg-primary');
            break;
    }
    toastEl.querySelector('.toast-body').textContent = msg;
    let toast = new bootstrap.Toast(toastEl, { delay: 10000, animation: true });
    toast.show();
}

export { showToast };

