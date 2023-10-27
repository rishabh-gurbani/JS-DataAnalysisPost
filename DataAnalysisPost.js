const getResponse = async (email, retries = 3) => {
    try{
        let response = await fetch(`https://one00x-data-analysis.onrender.com/assignment?email=${email}`,
            {method:'GET'})
        if(response.ok) {
            console.log("Request successful")
            const headers = response.headers
            const data = await response.json()
            return ['success', headers.get('x-assignment-id'), data]
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
            }else{
                console.log(response.status)
                return ['failed', null, null]
            }
        }
    } catch (e){
        console.log(e)
        return ['failed', null, null]
    }
}

const findMaxFrequencyWords = (data) =>{
    const frequencies = new Map()
    let maxCount = 0

    data.forEach(entry => {
        const entryData = frequencies.get(entry)
        if (entryData) frequencies.set(entry, entryData+1)
        else frequencies.set(entry, 1)
        maxCount = maxCount > frequencies.get(entry)
            ? maxCount
            : frequencies.get(entry)
    })

    const maxCountWords = [...frequencies]
        .filter(([key, value]) => value === maxCount)
        .map((key, value) => key)

    return maxCountWords
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
        console.log("Submitted: "+maxWord)
        const data = await response.json()
        return data
    } catch (e){
        console.log(e)
    }
}


const main = async (email) => {
    const [status, assignmentID, data] = await getResponse(email)
    if (status==='failed') return
    const maxWords = findMaxFrequencyWords(data)
    for(const [word, freq] of maxWords){
        const submissionResponse =
            await postResponse (email,[assignmentID, word])
        console.log(submissionResponse)
        if(await submissionResponse === 'submitted_correct') break
    }
}

main('rishabh.gurbani23@gmail.com')
