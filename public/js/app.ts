(function () {
    const form = document.querySelector('form');
    const img = <HTMLImageElement>document.querySelector('img');
    const input = <HTMLInputElement>document.getElementById('avatar');
    const progress = <HTMLElement>document.querySelector('.progress');

    if (!form) {
        console.log('Danger! No form :(');
        return;
    }

    if (!img) {
        console.log('Danger! No image :(');
        return;
    }

    form.addEventListener('submit', onSubmit, false);

    function onSubmit(ev: Event) {
        ev.preventDefault();

        if (!input) {
            console.log('Danger! No input :(');
            return;
        } else if (!input.files) {
            console.log('Danger! No input files :(');
            return;
        } else if (!FormData) {
            alert('Image upload not supported');
            return;
        }

        const file = input.files[0];

        if (!file) {
            console.log('Danger! No file found :(');
            return;
        }

        const xhr = new XMLHttpRequest();

        if (!!progress) {
            xhr.upload.addEventListener('progress', (ev) => {
                if (!ev.lengthComputable) {
                    progress.textContent = '';
                    return;
                }

                const percent = ev.loaded / ev.total;
                progress.textContent = `${Math.round(percent * 100)}%`;
            }, false);
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                const status = xhr.status;

                if ((status >= 200 && status < 300) || status === 304) {
                    const res = JSON.parse(xhr.response);

                    if (!res) {
                        alert('No file upload response');
                        return;
                    }

                    const url = res.url;
                    img.src = url;
                    img.classList.remove('hidden');
                } else {
                    alert('File upload failed');
                }
            }
        };

        const payload = new FormData();

        payload.append('file', file);

        xhr.open('POST', '/api/v1/users/watermark', true);
        xhr.send(payload);
    }
})();