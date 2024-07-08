// canvas
const canvas = document.querySelector("#myCanvas")
const ctx = canvas.getContext('2d')
let totalX_cordinate=0, totalY_cordinate=0
function resizeCanvas(){
    // canvas.height = canvas.clientHeight
    // canvas.width = canvas.clientWidth
    if(window.innerWidth < 850)
    {
        // canvas.height = canvas.clientHeight
        // canvas.width = canvas.clientWidth
        canvas.width = window.innerWidth - 24
        canvas.height = window.innerHeight - document.querySelector('.feature-section').clientHeight - 34
    }
    else{
        canvas.width = (window.innerWidth - 24)*(75/100)
        canvas.height = window.innerHeight - 24
    }
    if(totalX_cordinate===0 && totalY_cordinate===0)
    {
        totalX_cordinate = canvas.getBoundingClientRect().right - canvas.getBoundingClientRect().left
        totalY_cordinate = canvas.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top
    }
    else
    {
        let curTotalX_cordinate = canvas.getBoundingClientRect().right - canvas.getBoundingClientRect().left
        let curTotalY_cordinate = canvas.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top
        
        // remove all path2D
        cityPath2D.splice(0, cityPath2D.length)
        for(let idx=0; idx<cityList.length; idx++)
        {
            cityList[idx][1] = (cityList[idx][1]/totalX_cordinate)*curTotalX_cordinate
            cityList[idx][2] = (cityList[idx][2]/totalY_cordinate)*curTotalY_cordinate

            // draw this city
            drawCity(cityList[idx][0], cityList[idx][1], cityList[idx][2]);
        }

        // Draw the roads
        roadPath2D.splice(0, roadPath2D.length)
        for(let idx=0; idx<roadList.length; idx++)
        {
            const indexOfFirstCity = getIndexOfCity(roadList[idx][0])
            const indexOfSecondCity = getIndexOfCity(roadList[idx][1])
            const x1 = cityList[indexOfFirstCity][1]
            const y1 = cityList[indexOfFirstCity][2]
            const x2 = cityList[indexOfSecondCity][1]
            const y2 = cityList[indexOfSecondCity][2]
            const distance = roadList[idx][2]
            drawRoad(x1, y1, x2, y2, distance)
        }
        totalX_cordinate = curTotalX_cordinate
        totalY_cordinate = curTotalY_cordinate
    }
}

resizeCanvas()
window.addEventListener('resize', resizeCanvas)

// Data
// store {cityName, x-cordinate, y-cordinate} of each city
let cityList = [];
let noOfCity = 0
let roadList = [];  // store {firstCity, secondCity, distance}
let graph = []; // store all the adjacent city
let cityPath2D = [];
let roadPath2D = [];

// add City
document.querySelector("#addCityBtn").addEventListener("click", function(){

    // if you click on addCityBtn instead provide location of previous city
    if(clickAgainInsteadProvideLocation() === true)
    {
        return;
    }
    const selectCityNameInput = document.querySelector("#cityNameInput")
    const cityName = selectCityNameInput.value.trim()
    
    // check valid city
    if(cityName.length == 0)
    {
        window.alert("Enter valid string name!")
        return;
    }
    if(isExist_city(cityName) == true)
    {
        window.alert('City already exist!')
        noOfCity--
        return;
    }
    // location on graph
    canvas.addEventListener("click", addCityOnCanvas)
    
    function addCityOnCanvas(e){
        // location of city in canvas
        const x = e.clientX - canvas.getBoundingClientRect().left
        const y = e.clientY - canvas.getBoundingClientRect().top

        // store city Deatails [cityName, x-cordinate, y-cordinate]
        let cityDetails = [cityName, x, y]
        cityList.push(cityDetails);

        // Draw circle to denote City
        drawCity(cityName, x, y)
        
        canvas.removeEventListener('click', addCityOnCanvas)
    }
    selectCityNameInput.value = ""
})

function clickAgainInsteadProvideLocation()
{
    noOfCity++;
    if(noOfCity-1 != cityList.length)
    {
        window.alert('Please provide location of the city')
        noOfCity--
        return true;
    }
    return false
}
function isExist_city(cityName)
{
    for(let i=0; i<cityList.length; i++)
    {
        if(cityList[i][0] === cityName)
            return true
    }
    return false
}
// Draw circle to denote City
function drawCity(cityName, x, y)
{
    let path = new Path2D()
    path.arc(x, y, 10, 0, 2*Math.PI)
    ctx.fillStyle = '#000000'
    ctx.fill(path)
    // store that shape
    cityPath2D.push(path)

    ctx.font = "15px sans-serif"
    ctx.textAlign = "center"
    if(y>20)
        ctx.fillText(cityName, x, y-20);
    else
        ctx.fillText(cityName, x, y+20);
}
// add Road
document.querySelector('#addRoadBtn').addEventListener('click', function(){
    // select input field
    const selectFirstCityInput = document.querySelector('#city1Input')
    const selectSecondCityInput = document.querySelector('#city2Input')
    const selectDistanceInput = document.querySelector('#distanceInput')

    // check valid input
    const firstCityName = selectFirstCityInput.value.trim()
    const secondCityName = selectSecondCityInput.value.trim()
    // is two city valid or not
    if(isValid_city(firstCityName)===false || isValid_city(secondCityName)===false)
    {
        return;
    }
    if(firstCityName === secondCityName)
    {
        window.alert('Please give different city!')
        return;
    }
    
    // check validity of distance
    const distance = parseInt(selectDistanceInput.value)
    if(isValid_distance(distance) === false)
    {
        window.alert('Please give a valid distance!')
        return;
    }

    // index of city in cityList
    const indexOfFirstCity = getIndexOfCity(firstCityName)
    const indexOfSecondCity = getIndexOfCity(secondCityName)

    // store this road
    let roadDetails = [firstCityName, secondCityName, distance]
    roadList.push(roadDetails)

    // store in a graph
    if(graph[indexOfFirstCity] === undefined)
        graph[indexOfFirstCity] = []
    if(graph[indexOfSecondCity] === undefined)
        graph[indexOfSecondCity] = []
    graph[indexOfFirstCity].push([indexOfSecondCity, distance])
    graph[indexOfSecondCity].push([indexOfFirstCity, distance])

    const x1 = cityList[indexOfFirstCity][1]
    const y1 = cityList[indexOfFirstCity][2]
    const x2 = cityList[indexOfSecondCity][1]
    const y2 = cityList[indexOfSecondCity][2]
    drawRoad(x1, y1, x2, y2, distance)

    selectFirstCityInput.value = selectSecondCityInput.value = selectDistanceInput.value = ""

})
function isValid_city(cityName)
{
    // empty city name
    if(cityName.length === 0){
        window.alert('Empty city Name')
        return false;
    }
    // is city name exist
    if(isExist_city(cityName) === false)
    {
        window.alert("City doesn't exist")
        return false;
    }
    return true;
}
function isValid_distance(distance)
{   
    // is distance a number or not
    if((typeof distance === NaN) || distance<0)
        return false;
    return true;
}
function getIndexOfCity(cityName)
{
    for(let i=0; i<cityList.length; i++)
    {
        if(cityList[i][0] === cityName)
            return i;
    }
}
function drawRoad(x1, y1, x2, y2, distance)
{
    let path = new Path2D()
    path.moveTo(x1, y1)
    path.lineTo(x2, y2)
    ctx.strokeStyle = '#000000'
    ctx.stroke(path)
    // store that path
    roadPath2D.push(path)

    let angleInRadians = Math.atan2(y1-y2, x1-x2)
    const midX1 = (x1+x2)/2
    const midY1 = (y1+y2)/2
    ctx.font = "15px sans-sarif"
    ctx.textAlign = "start"
    
    // ctx.save()
    // ctx.translate(midX1+5, midY1+5)
    // ctx.rotate(angleInRadians)
    // angleInRadians = Math.abs(angleInRadians)
    // if(angleInRadians>Math.PI/2 && angleInRadians<3*Math.PI/2)
    // {
    //     ctx.fillText(reverseString(distance.toString()), 0, 0)
    // }
    // else{
    //     ctx.fillText(distance, 0, 0)
    // }
    
    ctx.fillText(distance, midX1, midY1)
    // ctx.restore()
}
function reverseString(str)
{
    let ans = '';
    for(let i=str.length-1; i>=0; i--)
        ans += str[i];
    return ans
}
// get shortest path
document.querySelector('#shortestPathBtn').addEventListener('click', fshortestPath)

function fshortestPath(){
    const selectSourceInput = document.querySelector('#sourceInput')
    const selectDestinationInput = document.querySelector('#destinationInput')

    // check whether this city exist or not
    const sourceCityName = selectSourceInput.value.trim()
    const destinationCityName = selectDestinationInput.value.trim()

    if(isValid_city(sourceCityName)===false || isValid_city(destinationCityName)===false)
    {
        return;
    }
    // to get shortest Path and visualise in canvas
    search_shortestPath(sourceCityName, destinationCityName)

    selectSourceInput.value = selectDestinationInput.value = ''
}
function search_shortestPath(sourceCityName, destinationCityName)
{
    let distanceArray = new Array(cityList.length)
    let parentArray = new Array(cityList.length)

    // initializa distanceArray and parentArray
    for(let idx=0; idx<cityList.length; idx++)
    {
        distanceArray[idx] = -1;
        parentArray[idx] = idx;
    }

    let indexOfSource = getIndexOfCity(sourceCityName)
    let indexOfDestination = getIndexOfCity(destinationCityName)

    // distance of source from source is 0
    distanceArray[indexOfSource] = 0

    let queue = new Queue()
    queue.enqueue(indexOfSource)

    while(queue.size() != 0)
    {
        let currentCity = queue.front()
        queue.dequeue()

        graph[currentCity].forEach(function(road){
            if(distanceArray[road[0]] === -1)
            {
                distanceArray[road[0]] = distanceArray[currentCity] + road[1]
                parentArray[road[0]] = currentCity
                queue.enqueue(road[0])
            }
            else if(distanceArray[currentCity]+road[1] < distanceArray[road[0]])
            {
                distanceArray[road[0]] = distanceArray[currentCity]+road[1]
                parentArray[road[0]] = currentCity
                queue.enqueue(road[0])
            }
        })
    }
    highlightShortestPath(indexOfSource, indexOfDestination, parentArray)
}
function highlightShortestPath(indexOfSource, indexOfDestination, parentArray)
{
    clearPreviousHighlight()
    if(parentArray[indexOfDestination] === indexOfDestination)
    {
        window.alert('There is no path exist from source to destination')
        return;
    }
    let indexOfCurCity = indexOfDestination
    while(parentArray[indexOfCurCity] != indexOfCurCity)
    {
        highlightCity(cityPath2D[indexOfCurCity], '#5E17EB')
        let indexOfRoad = getIndexOfRoad(indexOfCurCity, parentArray[indexOfCurCity])
        highlightRoad(roadPath2D[indexOfRoad], '#5E17EB')
        indexOfCurCity = parentArray[indexOfCurCity]
    }
    highlightCity(cityPath2D[indexOfCurCity], '#5E17EB')
}
function getIndexOfRoad(indexOfCity1, indexOfCity2)
{
    for(let idx=0; idx<roadList.length; idx++)
    {
        if((roadList[idx][0] === cityList[indexOfCity1][0] && roadList[idx][1] === cityList[indexOfCity2][0]) || (roadList[idx][0] === cityList[indexOfCity2][0] && roadList[idx][1] === cityList[indexOfCity1][0]))
        {
            return idx;
        }
    }
}
function clearPreviousHighlight()
{
    for(let idx=0; idx<cityPath2D.length; idx++)
    {
        if(cityPath2D[idx].fillStyle != '#000000')
            highlightCity(cityPath2D[idx], '#000000')
    }
    for(let idx=0; idx<roadPath2D.length; idx++)
    {
        if(roadPath2D[idx].strokeStyle != '#000000')
            highlightRoad(roadPath2D[idx], '#000000')
    }
}
function highlightCity(path, color){
    ctx.fillStyle = color
    ctx.fill(path)
}
function highlightRoad(path, color)
{
    ctx.strokeStyle = color
    ctx.stroke(path)
}
// queue object(class)
class Queue{
    constructor(){
        this.items = []
    }

    // adds a new element to the end
    enqueue(item){
        this.items.push(item)
    }

    // remove a element from front
    dequeue(){
        if(this.size() != 0){
            this.items.shift()
        }
    }

    // size of queue(no. of element)
    size()
    {
        return this.items.length
    }

    // return front element
    front(){
        return this.items[0]
    }
}
