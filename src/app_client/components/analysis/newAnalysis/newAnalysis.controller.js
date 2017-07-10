(function () {

	'use strict';

	angular
	.module('nativeQDAApp')
	.controller('newAnalysisCtrl', newAnalysisCtrl);

	/* @ngInject */
	function newAnalysisCtrl($uibModalInstance, $window, NgTableParams, datasetService, filesService, analysisService, authentication, logger, bsLoadingOverlayService) {
		var vm = this;

		// Bindable Functions
		vm.onSubmit = onSubmit;
		vm.viewFile = viewFile;

		// Bindable Data
		vm.data = [];
		vm.tableParams;
		vm.formData;
		vm.analysisResults;
		vm.isSubmittingButton = null;	// variables for button animation - ng-bs-animated-button
		vm.resultButton = null;
		vm.createButtonOptions = { buttonDefaultText: 'Analyse', animationCompleteTime: 1000, buttonSubmittingText: 'Processing...', buttonSuccessText: 'Done!' };

		activate();

		///////////////////////////

		function activate() {
			bsLoadingOverlayService.start({referenceId: 'data-list'});
			getDatasetList();
		}

		// Gets all the datasets from the MongoDB database
		function getDatasetList() {
			datasetService.listDatasets()
			.then(function(response) {
				response.data.forEach(function(data) {
					data.type = 'Dataset';
					vm.data.push(data);
				});
				getFileList();
			});
		}

		// Gets all the files from the MongoDB database
		function getFileList() {
			filesService.getFileListDB('true')
			.then(function(response) {
				response.data.forEach(function(data) {
					data.type = 'File';
					vm.data.push(data);
				});
				listData();
			});
		}

		function listData() {
			bsLoadingOverlayService.stop({referenceId: 'data-list'});
			vm.tableParams = new NgTableParams({
				sorting: {type: "desc"}
			}, {
				dataset: vm.data
			});
		}

		function onSubmit() {
			if(angular.isDefined(vm.formData)){
				if(!vm.formData.analysisName || !vm.formData.description) {
					logger.error('All fields required, please try again', '', 'Error');
				} else if(!vm.formData.selectedDataKey) {
					logger.error('Please select data for analysis', '', 'Error');
				} else {
					doAnalysis();
				}
			} else {
				logger.error('All fields required, please try again', '', 'Error');
			}
		}

		function doAnalysis() {
			vm.isSubmittingButton = true;
			filesService.signDownloadS3(vm.formData.selectedDataKey)
			.then(function(response) {
				analysisService.watsonAnalysis({url: response.data})
				.then(function(response) {
					vm.analysisResults = response.data;
					console.log(response.data);
					saveAnalysisResults();
				}, function(err) {
					vm.resultButton = 'error';
				});
			}, function(err) {
				vm.resultButton = 'error';
			});
		}

		function saveAnalysisResults() {
			var saveData = {
				name: vm.formData.analysisName,
				description: vm.formData.description,
				createdBy: authentication.currentUser().firstName,
				sourceDataKey: vm.formData.selectedDataKey,
				language: vm.analysisResults.language,
				categories: vm.analysisResults.categories,
				concepts: vm.analysisResults.concepts,
				entities: vm.analysisResults.entities,
				keywords: vm.analysisResults.keywords,
				relations: vm.analysisResults.relations,
				semanticRoles: vm.analysisResults.semanticRoles
			};

			analysisService.saveWatsonAnalysis(saveData)
			.then(function(response) {
				logger.success('Analysis "' + vm.formData.analysisName + '" successfully completed', '', 'Success')
				vm.resultButton = 'success';
				setTimeout(function() {
					vm.modal.close(response.data);	// Close modal if the analysis was completed successfully and return the new analysis data
				}, 1000);	// Timeout function so the user can see the analysis has completed before closing modal
			}, function(err) {
				vm.resultButton = 'error';
			});
		}

		// Gets signed URL to download the requested file from S3 
		// if successful, opens the signed URL in a new tab
		function viewFile(key) {
			filesService.signDownloadS3(key)
			.then(function(response) {
				$window.open(response.data, '_blank');
			});
		}

		vm.modal = {
			close : function(results) {
				$uibModalInstance.close(results);	// Return results
			}, 
			cancel : function () {
				$uibModalInstance.dismiss('cancel');
			}
		};

	}

})();