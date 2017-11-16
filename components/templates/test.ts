(async (i)=>{
    await console.log(i)
    let greeting = (m) => {
        console.log(m);
    }
    return Promise.resolve(greeting);
})('Hey there,').then((res) => {
    res.apply(this, ['I\'m a quick-learning dev \r\nReady to provide creative solutions!']);
});