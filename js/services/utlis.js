export const utils = {
    findIdxById
}

function findIdxById(Id, arr) {
    var Idx = arr.findIndex((object) => {
        return object.id === +Id
    })
    return Idx
}