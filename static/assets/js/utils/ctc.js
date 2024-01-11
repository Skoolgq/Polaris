import { uuid } from '../utils.js';

const ctc = {
    connect: (pageID) => {
        sessionStorage.getItem('ctc_' + pageID);

        sessionStorage['ctc_' + pageID]
    },
    register: () => {
        const registrationData = sessionStorage.getItem('ctc_registration') ? JSON.parse(sessionStorage.getItem('ctc_registration')) : {};
        const pageID = uuid();

        registrationData[pageID] = {
            location: location.href
        };

        sessionStorage.setItem('ctc_' + pageID);
    }
};

export default ctc;
export { ctc };