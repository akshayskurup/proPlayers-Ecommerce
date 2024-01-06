const genreManagement = {}
const genres = require('../model/genreSchema')

genreManagement.showGenre = async(req,res)=>{
    const updateMess = req.query.message || ""
    try {
        const genre = await genres.find()
        res.render('admin/genreManagement',{genre,updateMess})
    } catch (error) {
        
    }
}

genreManagement.addGenre = async(req,res)=>{
    try {
        
        res.render('admin/addGenre',{message:""})

    } catch (error) {
        console.error('Error displaying:', error);
        res.status(500).send('Internal Server Error');
    }
}
genreManagement.handleAddData =async(req,res)=>{
    const genreName = req.body.genreName
    try {
        const isGenreExist = await genres.exists({genre: genreName.toUpperCase() });
        if(isGenreExist){
            return res.render('admin/addGenre',{message:"This Genre already exists!"})
        }
        const genre = new genres({genre:genreName.toUpperCase()})
        await genre.save();
        res.redirect('/genre-management?message=Successfully%20Inserted')
        
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).send('Internal Server Error');
    }
}

genreManagement.toggle = async(req,res)=>{
    const genreId = req.params.id
    const genre = await genres.findById(genreId)
    try {
        genre.isListed = !genre.isListed
        await genre.save()
        res.redirect('/genre-management')
    } catch (error) {
        console.error('Error toggling data:', error);
        res.status(500).send('Internal Server Error');
    }
}

genreManagement.showEditGenre = async(req,res)=>{
    const genreId = req.params.id
    try {
        const genre = await genres.findById(genreId)
        res.render('admin/editGenre',{genre,message:""})
    } catch (error) {
        console.error('Error toggling data:', error);
        res.status(500).send('Internal Server Error');
    }
}

genreManagement.handleEditGenre = async(req,res)=>{
    const genreName = req.body.genreName
    const genreId = req.params.id
    const genre = await genres.findById(genreId)
    try {
        const isGenreExist = await genres.exists({ _id: { $ne: genreId }, genre: genreName.toUpperCase() });
        if(isGenreExist){
            return res.render('admin/editGenre',{genre,message:"This genre alreadt exists!"})
        }
        const UpdatedGenre = await genres.findByIdAndUpdate(genreId,{genre:genreName.toUpperCase()})
        res.redirect('/genre-management?message=Successfully%20Edited')       
    } catch (error) {
        console.error('Error editing data:', error);
        res.status(500).send('Internal Server Error');
    }
}
module.exports = genreManagement