import { Keyboard } from 'react-native';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { mainContainerActions } from '../reducers/mainContainer/mainReducerActions';
import { mainContainerFileActions } from '../reducers/mainContainer/Files/filesReducerActions';
import ListItemModel from '../models/ListItemModel';
import StorjLib from '../utils/StorjModule';
import FilePicker from '../utils/filePicker';
import TabBarActionModelFactory from '../models/TabBarActionModel';
import MainComponent from '../components/MainComponent';
import filePicker from '../utils/filePicker';

class MainContainer extends Component {
    constructor(props) {
        super(props);

        //this.state = {
        this.tapBarActions = [
            //actions for bucket screen
            TabBarActionModelFactory.createNewAction(() => { this.props.showCreateBucketInput(); }, 'Action 1', require('../images/ActionBar/NewBucketIcon.png')), 
            TabBarActionModelFactory.createNewAction(() => { console.log('Action 3') }, 'Action 2', require('../images/ActionBar/UploadFileIcon.png')),
            TabBarActionModelFactory.createNewAction(() => { console.log('Action 3') }, 'Action 3', require('../images/ActionBar/UploadPhotoIcon.png'))
        ];

        this.selectionModeActions = [
            //actions for bucket screen
            TabBarActionModelFactory.createNewAction(() => { console.log('Action 3') }, 'Action 1', require('../images/ActionBar/FavoritesIcon.png')), 
            TabBarActionModelFactory.createNewAction(() => { console.log('Action 3') }, 'Action 2', require('../images/ActionBar/DownloadIFileIcon.png')), 
            TabBarActionModelFactory.createNewAction(() => { console.log('Action 3') }, 'Action 3', require('../images/ActionBar/CopyBucketIcon.png')), 
            TabBarActionModelFactory.createNewAction(() => { this.deleteBuckets(); }, 'Action 3', require('../images/ActionBar/TrashBucketIcon.png'))
        ];
        //};  
        this.openedBucketActions = [
            TabBarActionModelFactory.createNewAction(() => { this.uploadFile(); }, 'Action 1', require('../images/ActionBar/UploadFileIcon.png')), 
            TabBarActionModelFactory.createNewAction(() => { console.log('Action 3') }, 'Action 2', require('../images/ActionBar/DownloadIFileIcon.png')),
            TabBarActionModelFactory.createNewAction(() => { console.log('Action 3') }, 'Action 3', require('../images/ActionBar/UploadPhotoIcon.png'))
        ]
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => { this.props.disableSelectionMode(); });
    }
    
    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
    }

    onCreateBucketPress() {
        this.props.showCreateBucketInput();
    }

    onActionBarPress() {
        this.props.isActionBarShown ? 
            this.props.hideActionBar() : this.props.showActionBar();
    }

    async uploadFile() {
        let filePicketResponse = await filePicker.show();

        this.props.setLoading();
        this.props.hideActionBar();

        if(filePicketResponse.path) {
            let uploadFileResponse = await StorjLib.uploadFile(this.props.openedBucketId, filePicketResponse.path);

            if(uploadFileResponse.isSuccess) {
                this.props.uploadFile(this.props.openedBucketId, new ListItemModel(uploadFileResponse.result));
            }
        }

        this.props.unsetLoading();
    }

    async createBucket(bucketName) {
        try {
            let createBucketResponse = await StorjLib.createBucket(bucketName);
           
            if(createBucketResponse.isSuccess) {
                this.props.createBucket(new ListItemModel(createBucketResponse.result));
            }
        } catch(e) {
            //Eror callback
            console.log('errorName: ' + e.name, "// errorMessage: " + e.message, "// errorCode: " + e.code);
        }
    }

    async deleteBucket(bucket) {
        let result = await StorjLib.deleteBucket(bucket.getId());

        if(result.isSuccess) {
            this.props.deleteBucket(bucket);
        }
    }

    getSelectedBuckets() {
        let selectedBuckets = [];

        this.props.buckets.map(item => {
            if(item.isSelected) {
                selectedBuckets.push(item);
            }
        });

        return selectedBuckets;
    }

    deleteBuckets() {
        this.getSelectedBuckets().forEach(item => {
            this.deleteBucket(item);
        });

        if(this.props.isSingleItemSelected)
            this.props.disableSelectionMode();
    }

    async getBuckets() {
        try {
            let buckets = await StorjLib.getBuckets();

            console.log(buckets);

            this.props.getBuckets(buckets.map((bucket => new ListItemModel(bucket))));
        } catch(e) {
            //Eror callback
            console.log('errorName: ' + e.name, "// errorMessage: " + e.message, "// errorCode: " + e.code);
        }
    }

    static navigationOptions = {
        header: null
    };

    render() {
        return(
            <MainComponent
                openedBucketId = { this.props.openedBucketId }
                createBucket = { this.createBucket.bind(this) }
                hideCreateBucketInput = { this.props.hideCreateBucketInput }
                tapBarActions = { this.tapBarActions } 
                selectionModeActions = { this.selectionModeActions }
                openedBucketActions = { this.openedBucketActions }
                isSelectionMode = { this.props.isSelectionMode }
                isSingleItemSelected = { this.props.isSingleItemSelected }
                onActionBarPress = { () => { this.onActionBarPress(); } }
                isActionBarShown = { this.props.isActionBarShown } 
                isCreateBucketInputShown = { this.props.isCreateBucketInputShown }
                isLoading = { this.props.isLoading } />
        );
    }
}

function mapStateToProps(state) { 
    return {
        openedBucketId: state.mainReducer.openedBucketId,
        isSelectionMode: state.mainReducer.isSelectionMode, 
        isSingleItemSelected: state.mainReducer.isSingleItemSelected,
        isActionBarShown: state.mainReducer.isActionBarShown,
        buckets: state.mainReducer.buckets,
        isCreateBucketInputShown: state.mainReducer.isCreateBucketInputShown,
        isFirstSignIn: state.mainReducer.isFirstSignIn,
        isLoading: state.mainReducer.isLoading
    };
}
function mapDispatchToProps(dispatch) { return bindActionCreators({ ...mainContainerActions, ...mainContainerFileActions }, dispatch); };

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);