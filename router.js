/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


ARC.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        var arc_business = {
            parent: 'arc_menu',
            name: 'arc_business',
            templateUrl: '../app/components/business/partials/business.html',
            controller: 'businessController'
        };

        var arc_business_capability_application_cost = {
            parent: 'arc_ITCostAnalysis',
            name: 'arc_business_capability_application_cost',
            url: '/arc_business_capability_application_cost',
            templateUrl: '../app/components/business/partials/business_capability_application_cost.html',
            controller: 'businessCapabilityApplicationCostChartController',
            resolve: {
                dataResults: ['$business', function ($business) {
                        var dataResults = $business.getBusinessCapabilitiesCostsbyApp().get().$promise.then(function (data) {
                            return data.status === 'SUCCESS' ? data.data : [];
                        }, function (error) {
                            return error;
                        });
                        return dataResults;
                    }]
            }
        };

		var arc_business_chart = {
			parent: 'arc_application',
			name: 'arc_business_chart',
			url: '/arc_business_chart',
			templateUrl: '../app/components/business/partials/business_chart.html',
			controller: 'businessChartController',
			resolve: {
				results: ['$organisation', '$application', '$businessCapability', '$q',  function ($organisation, $application, $businessCapability, $q) {


                
		var arc_business_chart = {
			parent: 'arc_application',
			name: 'arc_business_chart',
			url: '/arc_business_chart',
			templateUrl: '../app/components/business/partials/business_chart.html',
			controller: 'businessChartController',
			resolve: {
				results: ['$organisation', '$application', '$businessCapability', '$q',  function ($organisation, $application, $businessCapability, $q) {


        var arc_business_chart = {
            parent: 'arc_application',
            name: 'arc_business_chart',
            url: '/arc_business_chart',
            templateUrl: '../app/components/business/partials/business_chart.html',
            controller: 'businessChartController',
            resolve: {
                results: ['$organisation', '$application', '$businessCapability', '$q', function ($organisation, $application, $businessCapability, $q) {

                        var result = $application.interface().getApplicationInterfaceChartData().get().$promise.then(function (data) {

                            if (data.status === 'SUCCESS') {

//                                                        console.log(data.data)
                                var newJSON = {
                                    nodes: [],
                                    links: [],
                                    organisations: [],
                                    marker: []
                                };
                                var applicationOrganisation = angular.copy(data.data['applicationOrganisation']);
                                var applications = angular.copy(data.data['applications']);
                                var organisations = angular.copy(data.data['organizationCharts']);
                                var applicationDataSets = angular.copy(data.data['applicationDataSets']);
                                var applicationBusinessCapability = angular.copy(data.data['applicationBusinessCapability']);
                                var businessCapabilities = angular.copy(data.data['businessCapability']);
                                var dataSets = angular.copy(data.data['dataSets']);
                                var interfaces = angular.copy(data.data['interfaces']);
                                var interfaceDataSet = angular.copy(data.data['interfaceDataSet']);
                                newJSON.dataSets = [];
                                newJSON.businessCapabilities = [];

                                _.forEach(applicationOrganisation, function (row) {
                                    _.each(applications, function (o) {
                                        if (row.applicationId == o.id && !o.organisations) {
                                            o.organaisationId = row.organaisationId;
                                            o.organisations = [{
                                                    id: row.organaisationId,
                                                    name: ''
                                                }];
                                        } else if (row.applicationId == o.id && o.organisations) {
                                            o.organaisationId = row.organaisationId;
                                            o.organisations.push({
                                                id: row.organaisationId,
                                                name: ''
                                            });
                                        }
                                    })

                                })

                                _.forEach(organisations, function (row) {
                                    _.each(applications, function (o) {
                                        if (o.organaisationId && row.child.id == o.organaisationId) {
                                            o.organaisationName = row.child.name;
                                        }
                                        _.each(o.organisations, function (el) {
                                            if (el.id == row.child.id) {
                                                el.name = row.child.name;
                                            }
                                        })
                                    })

                                    newJSON.organisations.push({
                                        name: row.child.name,
                                        id: row.child.id,
                                        parentId: (row.parent && row.parent.id) ? row.parent.id : -1
                                    })
                                });

                                _.forEach(newJSON.organisations, function (o) {
                                    _.each(newJSON.organisations, function (el) {
                                        if (o.id == el.parentId && !o.child) {
                                            o.child = [el.id]
                                        } else if (o.id == el.parentId && o.child) {
                                            o.child.push(el.id)
                                        }
                                    })
                                });

                                /*
                                 * set the organaisationId -1 for all application that don't have organaisation 'External application'
                                 */

                                _.each(applications, function (o) {
                                    if (!o.organaisationId) {
                                        o.organaisationName = 'None';
                                        o.organaisationId = -1;
                                    }
                                    if (!o.organisations) {
                                        o.organisations = [];
                                        o.organisations.push({
                                            id: -1,
                                            name: 'None'
                                        })
                                    }
                                });

                                _.forEach(interfaces, function (row) {
                                    _.each(applications, function (o) {
                                        if (row.destination && row.source && (o.id == row.destination.id || o.id == row.source.id)) {
                                            if (o.interfaces) {
                                                o.interfaces.push(row)
                                            } else {
                                                o.interfaces = [];
                                                o.interfaces.push(row)
                                            }
                                        }
                                    })
                                })

                                _.forEach(interfaces, function (row) {
                                    _.each(applications, function (o) {
                                        if (row.destination && row.source && (o.id == row.destination.id || o.id == row.source.id)) {
                                            if (o.interfaces) {
                                                o.interfaces.push(row);
                                                o.interfaces = _.uniq(o.interfaces, 'id');
                                                if (o.dataSets) {
                                                    o.dataSets = _.uniq(o.dataSets, 'id');
                                                }
                                            } else {
                                                o.interfaces = [];
                                                o.interfaces.push(row)
                                            }
                                        }
                                    })
                                });


                                _.forEach(interfaces, function (row) {
                                    if (row.dataSets) {
                                        _.each(row.dataSets, function (el) {
                                            _.each(dataSets, function (o) {
                                                if (el && el.dataSetId == o.id) {
                                                    el.name = o.name
                                                }
                                            })
                                        })
                                    }
                                })

                                _.forEach(applications, function (row) {
                                    _.each(applicationDataSets, function (o) {
                                        if (row && o.dataSet && row.id == o.application.id && !row.dataSets) {
                                            row.dataSetName = o.dataSet.name
                                            row.dataSetId = o.dataSet.id;
                                            row.dataSets = [{
                                                    id: o.dataSet.id,
                                                    name: o.dataSet.name
                                                }]
                                        } else if (row && o.dataSet && row.id == o.application.id && row.dataSets) {
                                            row.dataSetName = o.dataSet.name
                                            row.dataSetId = o.dataSet.id;
                                            row.dataSets.push({
                                                id: o.dataSet.id,
                                                name: o.dataSet.name
                                            });
                                        }
                                    })
                                });

                                _.each(applications, function (o) {
                                    if (!o.dataSetId) {
                                        o.dataSetName = undefined;
                                        o.dataSetId = undefined;
                                    }
                                })

                                _.forEach(applicationBusinessCapability, function (row) {
                                    _.each(applications, function (o) {
                                        if (row.applicationId == o.id && !o.businessCapabilities) {
                                            o.businessCapabilityId = row.businessCapabilityId;
                                            o.businessCapabilities = [{
                                                    id: row.businessCapabilityId,
                                                    name: ''
                                                }]
                                        } else if (row.applicationId == o.id && o.businessCapabilities) {
                                            o.businessCapabilityId = row.businessCapabilityId;
                                            o.businessCapabilities.push({
                                                id: row.businessCapabilityId,
                                                name: ''
                                            })
                                        }
                                    })
                                })

                                _.forEach(businessCapabilities, function (row) {
                                    _.each(applications, function (o) {
                                        if (o.businessCapabilityId && row.child.id == o.businessCapabilityId) {
                                            o.businessCapabilityName = row.child.name;
                                        }
                                        ;

                                        _.each(o.businessCapabilities, function (el) {
                                            if (el.id == row.child.id) {
                                                el.name = row.child.name
                                            }
                                        })
                                    })
                                })

                                _.each(applications, function (o) {
                                    if (!o.businessCapabilityId) {
                                        o.businessCapabilityName = undefined;
                                        o.businessCapabilityId = undefined;
                                    }
                                })

                                _.forEach(interfaceDataSet, function (row) {
                                    _.each(applications, function (o) {
                                        if (row.dataSetId == o.dataSetId) {
                                            o.interfaceId = row.applicationInterfaceId;

                                        }
//                                                                        _.each(o.dataSets, function(el){
//                                                                            if (el.id == row.applicationInterfaceId && !o.interfaces){
//                                                                                o.interfaces =[{
//                                                                                   id: row.applicationInterfaceId,
//                                                                                   name: ''
//                                                                                }];
//                                                                            }else if (el.id == row.applicationInterfaceId && o.interfaces){
//                                                                                o.interfaces.push({
//                                                                                   id: row.applicationInterfaceId,
//                                                                                   name: ''
//                                                                                });
//                                                                            }
//                                                                        })
                                    })
                                })

                                _.forEach(interfaces, function (row) {
                                    _.each(applications, function (o) {
                                        if (o.interfaceId && row.id == o.interfaceId) {
                                            o.interfaceName = row.name;
                                            o.interfaceFreq = (row.frequency) ? row.frequency.name : null;
                                        }
//                                                                        console.log(row)
//                                                                        _.each(o.interfaces, function(el){
//                                                                            console.log(el)
////                                                                            if (el.id == row.id){
////                                                                                el.name = row.name;
////                                                                                el.interfaceFreq = (row.frequency) ? row.frequency.name : null;
////                                                                                el.destination = (row.destination) ? row.destination.id : null;
////                                                                                el.source = (row.source) ? row.source.id : null;
////                                                                                el.destinationName = (row.destination) ? row.destination.name : null;
////                                                                                el.sourceName = (row.source) ? row.source.name : null;
////                                                                            }
//                                                                        })
                                    })
                                });

                                _.forEach(interfaces, function (row) {
                                    _.each(applications, function (o) {
                                        if (row.source && row.destination && row.source.id == o.id) {
                                            o.destination = row.destination.id;
                                            o.destinationName = row.destination.name;
                                            row.organaisationId = o.organaisationId;

                                            newJSON.marker.push({
                                                id: o.destination,
                                                organaisationId: o.organaisationId
                                            })

                                        }
                                        if (row.source && row.destination && row.destination.id == o.id) {
                                            o.source = row.source.id;
                                            o.sourceName = row.source.name;
                                        }
                                    });

                                    if (row.source && row.source.id && row.destination && row.destination.id) {
                                        newJSON.links.push({
                                            source: row.source.id,
                                            target: row.destination.id,
                                            transactionType: (row.transactionType) ? row.transactionType.name : '',
                                            organaisationId: row.organaisationId
                                        })
                                    }

                                });


                                _.each(applications, function (o) {
                                    if (!o.interfaceId) {
                                        o.interfaceName = undefined;
                                        o.interfaceId = undefined;
                                        o.interfaceFreq = undefined;
                                    }

                                    if (!o.source) {
                                        o.source = undefined;
                                        o.sourceName = undefined;
                                    }

                                    if (!o.destination) {
                                        o.destination = undefined;
                                        o.destinationName = undefined;
                                    }
                                })
                                newJSON.nodes = applications;

                                newJSON.organisations.unshift({
                                    id: -1,
                                    name: 'External Applications'
                                });

                                _.each(businessCapabilities, function (o) {
                                    o.child.parentId = (o.parent && o.parent.id) ? o.parent.id : '';
                                    newJSON.businessCapabilities.push(o.child);
                                });

                                _.each(data.data['dataSets'], function (o) {
                                    o.child.parentId = (o.parent && o.parent.id) ? o.parent.id : '';
                                    newJSON.dataSets.push(o.child);
                                })

//							newJSON.organisations.unshift({
//								id: 'all',
//								name: 'None Selected'
//							});
//
//							newJSON.dataSets.unshift({
//								id: 'all',
//								name: 'None Selected'
//							});
//
//							newJSON.businessCapabilities.unshift({
//								id: 'all',
//								name: 'None Selected'
//							});
                                _.forEach(newJSON.dataSets, function (o) {
                                    _.each(newJSON.dataSets, function (el) {
                                        if (o.id == el.parentId && !o.child) {
                                            o.child = [el.id]
                                        } else if (o.id == el.parentId && o.child) {
                                            o.child.push(el.id)
                                        }
                                    })
                                });

                                _.forEach(newJSON.businessCapabilities, function (o) {
                                    _.each(newJSON.businessCapabilities, function (el) {
                                        if (o.id == el.parentId && !o.child) {
                                            o.child = [el.id]
                                        } else if (o.id == el.parentId && o.child) {
                                            o.child.push(el.id)
                                        }
                                    })
                                });

                                _.each(newJSON.nodes, function (el) {
                                    el.businessCapabilities = _.uniq(el.businessCapabilities, 'id');
                                    el.dataSets = _.uniq(el.dataSets, 'id');
                                    el.organisations = _.uniq(el.organisations, 'id');
                                    el.interfaces = _.uniq(el.interfaces, 'id');
                                });

                                newJSON.applications = applications
                                _.uniq(newJSON.marker, 'id');
                                return newJSON;

                            } else {
                                return [];
                            }


                        }, function (error) {
                            return error;
                        });

                        var finalResults = $q.all([result]).then(function (data) {
                            return data[0];
                        })
                        return finalResults;
                    }]
            }
        };


						if (data.status === 'SUCCESS') {
							var fillter = function (data) {
								_.forEach(data, function (row) {
									for (var key in row.parent) {
										row[key] = row.parent[key];
									}
									delete row.parent;
									if (row.child) {
										row.children = fillter(row.child);
									}
									delete row.child;
								});
								return data;
							};
							return fillter(data.data);
						} else {
							return [];
						}
					}, function (error) {
						return error;
					});
					return result;
				}]
			}
		};
                
		var arc_business_strategic_relationship_chart = {
			parent: 'arc_businessGoals',
			name: 'arc_business_strategic_relationship_chart',
			url: '/arc_business_strategic_relationship_chart',
			templateUrl: '../app/components/business/partials/business_strategic_relationship_chart.html',
			controller: 'businessStrategicRelationshipChartController',
			resolve: {
				data: ['$initiative', function ($initiative) {
					var result = $initiative.getRequiredData().get().$promise.then(function (data) {

						if (data.status === 'SUCCESS') {
							var fillter = function (data) {
								_.forEach(data, function (row) {
									for (var key in row.parent) {
										row[key] = row.parent[key];
									}
									delete row.parent;
									if (row.child) {
										row.children = fillter(row.child);
									}
									delete row.child;
								});
								return data;
							};
							return fillter(data.data);
						} else {
							return [];
						}
					}, function (error) {
						return error;
					});
					return result;
				}]
			}
		};
		var arc_business_strategic_relationship_chart = {
			parent: 'arc_businessGoals',
			name: 'arc_business_strategic_relationship_chart',
			url: '/arc_business_strategic_relationship_chart',
			templateUrl: '../app/components/business/partials/business_strategic_relationship_chart.html',
			controller: 'businessStrategicRelationshipChartController',
			resolve: {
				data: ['$initiative', function ($initiative) {
					var result = $initiative.getRequiredData().get().$promise.then(function (data) {

        var arc_business_capability_chart = {
            parent: 'arc_business',
            name: 'arc_business_capability_chart',
            url: '/arc_business_capability_chart',
            templateUrl: '../app/components/business/partials/business_capability_tree_chart.html',
            controller: 'businessTreeChartController',
            resolve: {
                data: ['$businessCapability', function ($businessCapability) {
                        var result = $businessCapability.getBusinessCapabilityChart().get().$promise.then(function (data) {

                            if (data.status === 'SUCCESS') {
                                var fillter = function (data) {
                                    _.forEach(data, function (row) {
                                        for (var key in row.parent) {
                                            row[key] = row.parent[key];
                                        }
                                        delete row.parent;
                                        if (row.child) {
                                            row.children = fillter(row.child);
                                        }
                                        delete row.child;
                                    });

                                    return data;
                                };
                                return fillter(data.data);
                            } else {
                                return [];
                            }
                        }, function (error) {
                            return error;
                        });
                        return result;
                    }]
            }
        };

        var arc_business_functions_chart = {
            parent: 'arc_business',
            name: 'arc_business_functions_chart',
            url: '/arc_business_functions_chart',
            templateUrl: '../app/components/business/partials/business_functions_tree_chart.html',
            controller: 'businessTreeFunctionsChartController',
            resolve: {
                data: ['$business', function ($business) {
                        var result = $business.getBusinessFunctionsTree().get().$promise.then(function (data) {

                            if (data.status === 'SUCCESS') {
                                var fillter = function (data) {
                                    _.forEach(data, function (row) {
                                        for (var key in row.parent) {
                                            row[key] = row.parent[key];
                                        }
                                        delete row.parent;
                                        if (row.child) {
                                            row.children = fillter(row.child);
                                        }
                                        delete row.child;
                                    });
                                    return data;
                                };
                                return fillter(data.data);
                            } else {
                                return [];
                            }
                        }, function (error) {
                            return error;
                        });
                        return result;
                    }]
            }
        };
        var arc_business_strategic_relationship_chart = {
            parent: 'arc_businessGoals',
            name: 'arc_business_strategic_relationship_chart',
            url: '/arc_business_strategic_relationship_chart',
            templateUrl: '../app/components/business/partials/business_strategic_relationship_chart.html',
            controller: 'businessStrategicRelationshipChartController',
            resolve: {
                data: ['$initiative', function ($initiative) {
                        var result = $initiative.getRequiredData().get().$promise.then(function (data) {

                            if (data.status === 'SUCCESS') {
                                var newJSON = {
                                    "title1": "Goals",
                                    "title2": "Initiatives",
                                    "title3": "Projects",
                                    "nodes": [],
                                    "links1": [],
                                    "links2": [],
                                    "marker": []
                                };


                                _.each(data.data.goalsDetails, function (row) {
                                    row.id = row.id + 'G'
                                });

                                _.each(data.data.initiativesDetails, function (row) {
                                    row.id = row.id + 'I'
                                });

                                _.each(data.data.projectsDetails, function (row) {
                                    row.id = row.id + 'P'
                                });
                                newJSON.nodes = data.data.goalsDetails.concat(data.data.initiativesDetails, data.data.projectsDetails);

		var arc_data_flow_chart = {
			parent: 'arc_application',
			name: 'arc_data_flow_chart',
			url: '/arc_data_flow_chart',
			templateUrl: '../app/components/business/partials/businessarc_data_flow_chart.html',
			controller: 'businessarcDatFlowChartController',
			resolve: {
				data: ['$application', function ($application) {
                                    var result = $application.interface().getApplicationInterfaceChartData().get().$promise.then(function (data) {

                                         if (data.status === 'SUCCESS') { 
//                                                    console.log(data.data)
                                             var applicationOrganisation = angular.copy(data.data['applicationOrganisation']);
                                             var applications = angular.copy(data.data['applications']);
                                             var organisation = angular.copy(data.data['organisation']);
                                             var applicationDataSets = angular.copy(data.data['applicationDataSets']);
                                             var applicationBusinessCapability = angular.copy(data.data['applicationBusinessCapability']);
                                             var businessCapabilities = angular.copy(data.data['businessCapability']);
                                             var dataSets = angular.copy(data.data['dataSets']);
                                             var interfaces = angular.copy(data.data['interfaces']);
                                             var interfaceDataSet = angular.copy(data.data['interfaceDataSet']);
                                             var Org = [];
                                             var Orgs = [];
                                             var App = [];
                                             var Apps = [];
                                             var A = [];
                                             var B = [];
                                             var flag = true;
                                            
                                            _.forEach(applicationOrganisation,function(d,i){
                                                Org.push(d.organaisationId)
                                                App.push(d.applicationId)
                                            })
                                            
                                            Org = _.uniq(Org)
                                            App = _.uniq(App)  
//                                            console.log(App,Org,'OOOOOOOOOOOOOOOOOOOOOOOOOOO')
                                            
                                            _.forEach(organisation,function(d,i){
                                                _.forEach(Org,function(o,j){
                                                    if(d.id == o)
                                                    Orgs.push(d)
                                                })
                                            })
                                            
                                            _.forEach(applications,function(d){
                                                _.forEach(App,function(o){
                                                    if(d.id == o)
                                                    Apps.push(d)
                                                })
                                            })
//                                            console.log(Apps,Orgs,'OOOOOOOOOOOOOOOOOOOOOOOOOOOSSSS')
                                            
                                            _.forEach(applicationOrganisation,function(d){
                                                _.forEach(Orgs,function(o){
                                                    if(d.organaisationId == o.id){
                                                        flag = true;
                                                        _.forEach(Apps,function(a){
                                                            if(d.applicationId == a.id){
                                                                if(!o.App){
                                                                    o.App = [a];
                                                                }else{
                                                                    _.forEach(o.App,function(b){
                                                                        if(b.id == a.id){
                                                                            flag = false;
                                                                       }
                                                                    })
                                                                    if(flag){
                                                                        o.App.push(a)    
                                                                   }
                                                                }
                                                            }
                                                        })
                                                    }
                                                })
                                            })
                                            
                                            _.forEach(Orgs,function(d,i){
                                                A.push([d.App[0].id,d.id])
                                            })   
                                            
                                            _.forEach(applicationOrganisation,function(d,i){
                                                B.push([d.applicationId,d.organaisationId])
                                            })
                                            
                                             var JSON = {
                                                     nodes: Apps,
                                                     links: interfaces,
                                                     organisations: Orgs
                                             };
                                             
                                             
                                             return JSON ;
                                         } else {
                                             return [];   
                                         }
                                    })        
                                    return result;         
				}]
                        }
		};               
                
		$stateProvider.state(arc_business);
		$stateProvider.state(arc_business_capability_application_cost);
		$stateProvider.state(arc_business_portfolio_chart);
		$stateProvider.state(arc_business_chart);
		$stateProvider.state(arc_business_capability_chart);
		$stateProvider.state(arc_business_functions_chart);
		$stateProvider.state(arc_business_strategic_relationship_chart);

                                _.forEach(data.data.goalsInitiativesRelationship, function (row) {
                                    newJSON.links1.push({
                                        source: row.businessGoalId + 'G',
                                        target: row.initiativeId + 'I'
                                    })
                                    newJSON.marker.push(row.initiativeId + 'I')
                                });
                                
		$stateProvider.state(arc_data_flow_chart);

                                _.forEach(data.data.initiativesProjectsRelationship, function (row) {
                                    newJSON.links2.push({
                                        source: row.initiativeId + 'I',
                                        target: row.projectId + 'P'
                                    })
                                    newJSON.marker.push(row.projectId + 'P')

                                });
                                return newJSON;
                            } else {
                                return [];
                            }
                        }, function (error) {
                            return error;
                        });
                        return result;
                    }]
            }
        };

        var arc_business_portfolio_chart = {
            parent: 'arc_business',
            name: 'arc_business_portfolio_chart',
            url: '/arc_business_portfolio_chart',
            templateUrl: '../app/components/business/partials/business_portfolio_tree_chart.html',
            controller: 'businessPortfolioChartController',
            resolve: {
                data: ['$businessCapability', function ($businessCapability) {
                        return []

                    }]
            }
        };




        $stateProvider.state(arc_business);
        $stateProvider.state(arc_business_capability_application_cost);
        $stateProvider.state(arc_business_portfolio_chart);
        $stateProvider.state(arc_business_chart);
        $stateProvider.state(arc_business_capability_chart);
        $stateProvider.state(arc_business_functions_chart);
        $stateProvider.state(arc_business_strategic_relationship_chart);

    }
]);
