const load = () => {
    fetch('/assets/JSON/apps.json')
        .then(res => res.json())
        .then(apps => {
            apps.forEach(app => {
                const el = document.createElement('div');
                el.classList = 'app';
                el.innerHTML = `<img src="${app.image}"><h3>${app.name}</h3><span>${app.desc}</span>`;
                document.querySelector('.apps').appendChild(el);

                el.addEventListener('click', () => {
                    
                })
            });
        }).catch(e => {
            alert('Failed to load apps');
        });
}

export default { load };