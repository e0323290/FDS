import { handleErrors } from '../helpers';

function riderOrderCount(id) {
    const data = {id: id};
    const url = 'http://localhost:3000/api/v1/rider/orders';

    var request = new Request(url, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });

    return fetch(request) 
        .then(handleErrors)
        // .then((response) => {
        //     response.json()
        //     .then((data) => {
        //         console.log('countdata: ', data.count);
        //         return data
        //     })
        // })
}

export const riderService = {
    riderOrderCount,
}