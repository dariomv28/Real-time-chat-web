const upload = async (file) => {
    const date = new Date();
    const storageRef = ref(storage, 'images/' + `images/${date + file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
    (snapshot) => {

    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
  }, 
  (error) => {
    reject("Something went wrong!" + error.code);

    // switch (error.code) {
    //   case 'storage/unauthorized':

    //     break;
    //   case 'storage/canceled':

    //     break;



    //   case 'storage/unknown':

    //     break;
    // }
  }, 
  () => {
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      resolve(downloadURL);
    });
  }
);
    });
}

export default upload;
