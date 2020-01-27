const status = async (req, res) => {
    res
    .status(200)
    .send({
        "status": 'success'
    });
}

module.exports = {
    status
}