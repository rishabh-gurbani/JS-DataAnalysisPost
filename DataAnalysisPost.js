const getResponse = async (email, retries = 3) => {
    try{
        let response = await fetch(`https://one00x-data-analysis.onrender.com/assignment?email=${email}`,
            {method:'GET'})
        if(response.ok) {
            console.log("Request successful")
            const headers = response.headers
            const data = await response.json()
            return [headers.get('x-assignment-id'), data]
        } else {
            console.log('Request failed', response.status);
            if (response.status === 500){
                console.log('Internal Server Error')
                if (retries>0 && (!response || !response.ok)){
                    console.log(`${retries} left ...`)
                    response = await getResponse(email, retries-1)
                }
                if (response) {
                    console.log("Request successful")
                    return response
                }
            }
        }
    } catch (e){
        console.log(e)
    }
}

const findMaxFrequency = (data) =>{
    const frequencies = {};
    data.forEach(entry => {
        if (frequencies[entry]) frequencies[entry] += 1
        else frequencies[entry] = 1
    })
    const max = [...Object.entries(frequencies)]
        .reduce((acc, curr) => {
            return curr[1] > acc[1]
                ? curr
                : curr[1] < acc[1]
                    ? acc
                    : curr[0] > acc[0]
                        ? curr
                        : acc;
        })[0];
    return max
}


const postResponse = async (email, [assignmentID, maxWord]) => {
    const headers = {
        'Content-type': 'application/json',
    };
    try{
        const response = await fetch(`https://one00x-data-analysis.onrender.com/assignment?email=${email}`,
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    assignment_id: assignmentID,
                    answer: maxWord,
                }),
            })
        console.log("Submitted: ")
        const data = await response.json()
        console.log(data)
    } catch (e){
        console.log(e)
    }
}


const main = async (email) => {
    const [assignmentID, data] = await getResponse(email)
    const maxWord = findMaxFrequency(data)
    await postResponse (email,[assignmentID, maxWord])
}

main('rishabh.gurbani23@gmail.com')