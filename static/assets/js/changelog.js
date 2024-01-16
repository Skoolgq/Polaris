import { PolarisError } from './utils.js';

fetch('/api/changelog')
    .then(res => res.json())
    .then(changelog => {
        document.querySelector('#changelog_version').textContent = changelog.version !== 'unknown' ? 'v' + changelog.version : changelog.version;
        document.querySelector('#changelog_version_sha').textContent = changelog.commit.sha.slice(0, 7);
        document.querySelector('#changelog_up_to_date').textContent = changelog.upToDate ? 'yes' : 'no';
        document.querySelector('#changelog_mode').textContent = changelog.mode;

        changelog.changelog
            .forEach(change => {
                const log = document.createElement('div');
                document.querySelector('#changelog').appendChild(log);

                const date = document.createElement('p');
                date.textContent = change.date;
                date.classList = 'small';
                log.appendChild(date);

                const description = document.createElement('i');
                description.textContent = change.simpleDescription;
                description.classList = 'small';
                log.appendChild(description);
            });
    })
    .catch(() => new PolarisError('Failed to load changelog'));