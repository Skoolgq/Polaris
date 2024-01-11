import { uuid, EventEmitter } from '../utils.js';

const ctc = {
    /**
     * Check if a tab exists
     * @param {string} pageID 
     * @returns {boolean}
     */
    exists: (pageID) => Object.keys(sessionStorage).includes('ctc_' + pageID),
    connect: (remoteID, currentID) => new Promise((resolve, reject) => {
        if (ctc.exists(remoteID)) {
            sessionStorage.setItem('ctc_' + remoteID, currentID);

            const events = new EventEmitter();
            const channel = 'ctc_connection' + currentID + '>' + remoteID;
            var prev = sessionStorage.getItem(channel);
            
            const listener = setInterval(() => {
                if (sessionStorage.getItem(channel) === 'ctc:disconnect') {
                    sessionStorage.setItem(channel, '');
                    events.emit('disconnect');
                    clearInterval(listener);
                    
                    return;
                }
                
                if (prev !== sessionStorage.getItem(channel)) {
                    prev = sessionStorage.getItem(channel);

                    events.emit('message', sessionStorage.getItem(channel));
                }
            }, 10);

            return {
                disconnect: () => {
                    clearInterval(listener);
                    sessionStorage.setItem(channel, 'ctc:disconnect');
                }
            };
        } else reject('Tab does not exist');
    }),
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