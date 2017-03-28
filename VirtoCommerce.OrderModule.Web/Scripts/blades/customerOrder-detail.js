﻿angular.module('virtoCommerce.orderModule')
.controller('virtoCommerce.orderModule.customerOrderDetailController', ['$scope', '$window', 'platformWebApp.bladeNavigationService', 'platformWebApp.dialogService', 'virtoCommerce.orderModule.order_res_stores', 'platformWebApp.settings', 'virtoCommerce.customerModule.members', 'virtoCommerce.customerModule.memberTypesResolverService',
    function ($scope, $window, bladeNavigationService, dialogService, order_res_stores, settings, members, memberTypesResolverService) {
        var blade = $scope.blade;

        angular.extend(blade, {
            title: 'orders.blades.customerOrder-detail.title',
            titleValues: { customer: blade.customerOrder.customerName },
            subtitle: 'orders.blades.customerOrder-detail.subtitle'
        });

        blade.toolbarCommands.push({
            name: 'orders.blades.customerOrder-detail.labels.invoice',
            icon: 'fa fa-download',
            index: 5,
            executeMethod: function (blade) {
                $window.open('api/order/customerOrders/invoice/' + blade.currentEntity.number, '_blank');
            },
            canExecuteMethod: function () {
                return true;
            }
        });

        blade.stores = order_res_stores.query();
        blade.statuses = settings.getValues({ id: 'Order.Status' });
        blade.openStatusSettingManagement = function () {
            var newBlade = new DictionarySettingDetailBlade('Order.Status');
            newBlade.parentRefresh = function (data) { blade.statuses = data; };
            bladeNavigationService.showBlade(newBlade, blade);
        };

        blade.openCustomerDetails = function () {
            var customerMemberType = 'Contact';
            var foundTemplate = memberTypesResolverService.resolve(customerMemberType);
            if (foundTemplate) {
                var newBlade = angular.copy(foundTemplate.detailBlade);
                newBlade.currentEntity = { id: blade.customerOrder.customerId, memberType: customerMemberType };
                bladeNavigationService.showBlade(newBlade, blade);
            } else {
                dialogService.showNotificationDialog({
                    id: "error",
                    title: "customer.dialogs.unknown-member-type.title",
                    message: "customer.dialogs.unknown-member-type.message",
                    messageValues: { memberType: customerMemberType },
                });
            }
        };


        // load employees
        members.search(
           {
               memberType: 'Employee',
               //memberId: parent org. ID,
               sort: 'fullName:asc',
               take: 1000
           },
           function (data) {
               blade.employees = data.results;
           });

        blade.customInitialize = function () {
            blade.isLocked = blade.currentEntity.status == 'Completed' || blade.currentEntity.isCancelled;

            var orderLineItemsBlade = {
                id: 'customerOrderItems',
                currentEntity: blade.currentEntity,
                recalculateFn: blade.recalculate,
                controller: 'virtoCommerce.orderModule.customerOrderItemsController',
                template: 'Modules/$(VirtoCommerce.Orders)/Scripts/blades/customerOrder-items.tpl.html'
            };
            bladeNavigationService.showBlade(orderLineItemsBlade, blade);
        };

   
    }]);