import React from "react";
import storage from "../firebase";
import { Progress } from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./uploadSongs.css";
class UploadSongs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formControls: {
        description: "",
        tag: "",
        title: ""
      },
      loaded: 0,
      success: false,
      selectedFiles: [],
      urls: null
    };
  }

  checkMimeType = event => {
    //getting file object
    let files = event.target.files;
    //define message container
    let errors = [];
    // list allow mime type
    const types = [
      "audio/aac",
      "audio/mp3",
      "audio/oog",
      "audio/wav",
      "audio/wma"
    ];
    // loop access array
    for (let file of files) {
      // compare file type find doesn't match
      if (types.every(type => file.type !== type)) {
        console.log(file.type);
        // create error message and assign to container
        errors.push(`${file.type} is not a supported format\n`);
      }
    }
    for (let error of errors) {
      // if message not same old that mean has error
      // discard selected file
      toast.error(error);
      event.target.value = null;
    }
    return true;
  };

  maxSelectFile = event => {
    let files = event.target.files;
    if (files.length > 10) {
      const msg = "Only 10 songs can be uploaded at a time";
      event.target.value = null;
      toast.warn(msg);
      return false;
    }
    return true;
  };

  checkFileSize = event => {
    let files = event.target.files;
    let size = 12000000;
    let errors = [];
    for (let file of files) {
      if (file.size > size) {
        errors.push(`${file.type} is too large, please pick a smaller file\n`);
      }
    }
    for (let error of errors) {
      // if message not same old that mean has error
      // discard selected file
      toast.error(error);
      event.target.value = null;
    }
    return true;
  };

  savePost() {
    fetch("/api/posts/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        description: this.state.formControls.description,
        title: this.state.formControls.title,
        tag: this.state.formControls.tag,
        playlist: JSON.stringify(this.state.urls)
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }

        throw new Error("Post validation");
      })
      .then(post => {
        console.log(post);
        this.setState({
          success: true
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          error: true
        });
      });
  }
  onChangeHandler = event => {
    const files = event.target.files;
    if (
      this.maxSelectFile(event) &&
      this.checkMimeType(event) &&
      this.checkFileSize(event)
    ) {
      // if return true allow to setState
      this.setState({
        selectedFiles: files,
        loaded: 0
      });
    }
  };

  contentChangeHandler = event => {
    const name = event.target.name;
    const value = event.target.value;
    const updatedControls = {
      ...this.state.formControls
    };
    const updatedFormElement = {
      ...updatedControls[name]
    };
    updatedFormElement.value = value;
    updatedControls[name] = updatedFormElement;
    this.setState({ formControls: updatedControls });
  };

  onClickHandler = () => {
    let downloadUrls = [];
    for (let file of this.state.selectedFiles) {
      const uploadTask = storage.ref(`audio/${file.name}`).put(file);
      uploadTask.on(
        "state_changed",
        snapshot => {
          // Progress function
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.setState({
            loaded: progress
          });
        },
        error => {
          // Error function
          console.log(error);
        },
        () => {
          storage
            .ref("audio")
            .child(file.name)
            .getDownloadURL()
            .then(url => downloadUrls.push(url));
        }
      );
    }
    this.savePost();
    console.log(downloadUrls);
    this.setState({ url: downloadUrls });
  };

  render() {
    return (
      <div class="uploadContainer">
        <div class="row">
          <div class="offset-md-3 col-md-6">
            <div class="form-group files">
              <label>Upload Your File </label>
              <input
                type="file"
                class="form-control"
                multiple
                onChange={this.onChangeHandler}
              />
            </div>
            <div class="form-group">
              <ToastContainer />
              <Progress max="100" color="success" value={this.state.loaded}>
                {Math.round(this.state.loaded, 2)}%
              </Progress>
            </div>
            <br />
            <br />

            <form>
              <p>Title</p>
              <input
                name="title"
                className="uploadForm"
                value={this.state.title}
                onChange={this.contentChangeHandler}
                type="text"
              />{" "}
              <br />
              <p>Tags</p>
              <input
                name="tag"
                className="uploadForm"
                value={this.state.tag}
                onChange={this.contentChangeHandler}
                type="text"
              />{" "}
              <br />
              <p>Description</p>
              <textarea
                name="description"
                className="uploadForm"
                value={this.state.description}
                onChange={this.contentChangeHandler}
                cols="30"
                rows="4"
              ></textarea>
              <br /> <input name="democheckbox" type="checkbox" value="1" />{" "}
              Checkbox
              <br />
              <button
                type="button"
                class="btn btn-success btn-block"
                className="uploadButton"
                onClick={this.onClickHandler}
              >
                Upload
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default UploadSongs;
