public with sharing class resultTableController {
    
    @AuraEnabled(cacheable=true)
    public static Wrapper getRelatedCalculationRecords(String carbonCalculatorId) {
        Wrapper finalWrapper = new Wrapper();
        
        
        List<CalculationObj__c> relatedRecordsList = [SELECT Id, Name, Impact_category__c, Unit__c, Tier__c, Product__c, Value__c, Client__c
                                                      FROM CalculationObj__c 
                                                      WHERE Carbon_Calculator__c = :carbonCalculatorId 
                                                      WITH SECURITY_ENFORCED LIMIT 10000];
        List<Carbon_Calculator__c> carbCalList = [SELECT Name, Calculation_Date__c, Product_Type_Name__c,Total_P_Weight__c, Trade_Lane__r.Name,Trade_Lane__r.Origin_Country__c, Trade_Lane__r.Destination_Country__c, B_Country__c, E_Country__c, Container_Name__c, Container_Name_2__c FROM Carbon_Calculator__c
                                                  WHERE Id = :carbonCalculatorId LIMIT 1];
        
        if(relatedRecordsList.size() > 0) {
            finalWrapper = fillWrapper(relatedRecordsList, carbCalList);
        }
        return finalWrapper;
    }
    
    public static Wrapper fillWrapper(List<CalculationObj__c> calculationRecordsList, List<Carbon_Calculator__c> carbonCalulatorList) {
        Map<String, GoodpackWrapper> goodpackMap = new Map<String, GoodpackWrapper>();
        Map<String, CompetitorWrapper> competitorMap = new Map<String, CompetitorWrapper>();
        List<GoodpackWrapper> goodpackWrapperList = new List<GoodpackWrapper>();
        List<CompetitorWrapper> competitorWrapperList = new List<CompetitorWrapper>();
        Wrapper finalWrapper = new Wrapper();
        
        List<String> impactCategoryList = new List<String>{
            'Global warming',
                'Ozone formation, Human health',
                'Fine particulate matter formation',
                'Terrestrial acidification',
                'Freshwater eutrophication',
                'Land use',
                'Mineral resource scarcity',
                'Fossil resource scarcity',
                'Water consumption'
                };
                    
                    
                    for(String catgry : impactCategoryList) {
                        GoodpackWrapper gpwrap = new GoodpackWrapper();
                        gpwrap.ImpactCategory = catgry;
                        gpwrap.Unit = '';
                        gpwrap.Total = 0.0;
                        gpwrap.RawMaterialsManufacturingTool = 0.0;
                        gpwrap.PackingAccessoryTool = 0.0;
                        gpwrap.DistributionToPackerTool = 0.0;
                        gpwrap.UsePhaseTool = 0.0;
                        gpwrap.CollectionReconditioningTool = 0.0;
                        gpwrap.EoLContainerTool = 0.0;
                        goodpackMap.put(catgry, gpwrap);
                        
                        CompetitorWrapper cmpwrap = new CompetitorWrapper();
                        cmpwrap.ImpactCategory = catgry;
                        cmpwrap.Unit = '';
                        cmpwrap.Total = 0.0;
                        cmpwrap.RawMaterialsManufacturingTool = 0.0;
                        cmpwrap.PackingAccessoryTool = 0.0;
                        cmpwrap.DistributionToPackerTool = 0.0;
                        cmpwrap.UsePhaseTool = 0.0;
                        cmpwrap.CollectionReconditioningTool = 0.0;
                        cmpwrap.EoLContainerTool = 0.0;
                        competitorMap.put(catgry, cmpwrap);
                    }
        
        for(CalculationObj__c obj : calculationRecordsList) {
            if(obj.Client__c == 'Goodpack') {
                if(goodpackMap.containsKey(obj.Impact_category__c)) {
                    GoodpackWrapper wrap = goodpackMap.get(obj.Impact_category__c);
                    wrap.Unit = obj.Unit__c;
                    if(obj.Tier__c == 'Tier 0') {
                        wrap.Total += obj.Value__c.setScale(18);
                    }
                    switch on obj.Product__c {
                        when 'Raw Materials & Manufacturing_tool' {
                            wrap.RawMaterialsManufacturingTool = obj.Value__c.setScale(18);
                        }
                        when 'Packaging accessory_tool' {
                            wrap.PackingAccessoryTool = obj.Value__c.setScale(18);
                        }
                        when 'Distribution to packer_tool' {
                            wrap.DistributionToPackerTool = obj.Value__c.setScale(18);
                        }
                        when 'Use phase_tool' {
                            wrap.UsePhaseTool = obj.Value__c.setScale(18);
                        }
                        when 'Collection & Reconditioning_tool' {
                            wrap.CollectionReconditioningTool = obj.Value__c.setScale(18);
                        }
                        when 'EoL_Container_tool' {
                            wrap.EoLContainerTool = obj.Value__c.setScale(18);
                        }
                    }
                    goodpackMap.put(obj.Impact_category__c, wrap);
                }
            } else if(obj.Client__c == 'Competitor') {
                if(competitorMap.containsKey(obj.Impact_category__c)) {
                    CompetitorWrapper wrap = competitorMap.get(obj.Impact_category__c);
                    wrap.Unit = obj.Unit__c;
                    if(obj.Tier__c == 'Tier 0') {
                        wrap.Total += obj.Value__c.setScale(18);
                    }
                    switch on obj.Product__c {
                        when 'Raw Materials & Manufacturing_tool' {
                            wrap.RawMaterialsManufacturingTool = obj.Value__c.setScale(18);
                        }
                        when 'Packaging accessory_tool' {
                            wrap.PackingAccessoryTool = obj.Value__c.setScale(18);
                        }
                        when 'Distribution to packer_tool' {
                            wrap.DistributionToPackerTool = obj.Value__c.setScale(18);
                        }
                        when 'Use phase_tool' {
                            wrap.UsePhaseTool = obj.Value__c.setScale(18);
                        }
                        when 'Collection & Reconditioning_tool' {
                            wrap.CollectionReconditioningTool = obj.Value__c.setScale(18);
                        }
                        when 'EoL_Container_tool' {
                            wrap.EoLContainerTool = obj.Value__c.setScale(18);
                        }
                    }
                    competitorMap.put(obj.Impact_category__c, wrap);
                }
            }
            
        }
        
        for(String Key : goodpackMap.keySet()) {
            goodpackWrapperList.add(goodpackMap.get(Key));
        }
        for(String Key : competitorMap.keySet()) {
            competitorWrapperList.add(competitorMap.get(Key));
        }
        
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].Container_Name__c != NULL) {
            finalWrapper.GoodpackLabel = carbonCalulatorList[0].Container_Name__c;    
        } else {
            finalWrapper.GoodpackLabel = '';
        }
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].Container_Name_2__c != NULL) {
            finalWrapper.CompetitorLabel = carbonCalulatorList[0].Container_Name_2__c;    
        } else {
            finalWrapper.CompetitorLabel = '';
        }
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].Name != NULL)
            finalWrapper.calName = carbonCalulatorList[0].Name;
        else
            finalWrapper.calName = '';
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].Calculation_Date__c != NULL)
            finalWrapper.calDate = carbonCalulatorList[0].Calculation_Date__c;
        else
            finalWrapper.calDate = '';
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].Product_Type_Name__c != NULL)
            finalWrapper.calProduct = carbonCalulatorList[0].Product_Type_Name__c;
        else
            finalWrapper.calProduct = '';    
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].Trade_Lane__r.Name != NULL)
            finalWrapper.calTradelane = carbonCalulatorList[0].Trade_Lane__r.Name;
        else
            finalWrapper.calTradelane = '';
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].Total_P_Weight__c != NULL)
            finalWrapper.calProductWeight = carbonCalulatorList[0].Total_P_Weight__c;
        else
            finalWrapper.calProductWeight = 0.0;
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].Trade_Lane__r.Origin_Country__c != NULL)
            finalWrapper.calTradelaneOriginCountry = carbonCalulatorList[0].Trade_Lane__r.Origin_Country__c;
        else
            finalWrapper.calTradelaneOriginCountry = '';
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].Trade_Lane__r.Destination_Country__c != NULL)
            finalWrapper.calTradelaneDestinationCountry = carbonCalulatorList[0].Trade_Lane__r.Destination_Country__c;
        else
            finalWrapper.calTradelaneDestinationCountry = '';
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].B_Country__c != NULL)
            finalWrapper.calFromCountry = carbonCalulatorList[0].B_Country__c;
        else
            finalWrapper.calFromCountry = '';
        if(carbonCalulatorList.size() > 0 && carbonCalulatorList[0].E_Country__c != NULL)
            finalWrapper.calToCountry = carbonCalulatorList[0].E_Country__c;
        else
            finalWrapper.calToCountry = '';            
        finalWrapper.gpWrapper = goodpackWrapperList;
        finalWrapper.cmpWrapper = competitorWrapperList;
        
        return finalWrapper;
    }
    
    public class Wrapper {
        @AuraEnabled public String GoodpackLabel {get;set;}
        @AuraEnabled public String CompetitorLabel {get;set;}
        @AuraEnabled public String calName{get;set;}
        @AuraEnabled public String calDate{get;set;}
        @AuraEnabled public String calTradelane{get;set;}
        @AuraEnabled public String calProduct{get;set;}
        @AuraEnabled public Decimal calProductWeight{get;set;}
        @AuraEnabled public String calTradelaneOriginCountry{get;set;}
        @AuraEnabled public String calTradelaneDestinationCountry{get;set;}
        @AuraEnabled public String calFromCountry {get;set;} //This country will be used only when record is created from Manual entry and there is no tradelane
        @AuraEnabled public String calToCountry {get;set;} //This country will be used only when record is created from Manual entry and there is no tradelane
        @AuraEnabled public List<GoodpackWrapper> gpWrapper {get;set;}
        @AuraEnabled public List<CompetitorWrapper> cmpWrapper {get;set;}
        
        
    }
    
    public class GoodpackWrapper {
        @AuraEnabled public String ImpactCategory {get;set;}
        @AuraEnabled public String Unit {get;set;}
        @AuraEnabled public Decimal Total {get;set;}
        @AuraEnabled public Decimal RawMaterialsManufacturingTool {get;set;}
        @AuraEnabled public Decimal PackingAccessoryTool {get;set;}
        @AuraEnabled public Decimal DistributionToPackerTool {get;set;}
        @AuraEnabled public Decimal UsePhaseTool {get;set;}
        @AuraEnabled public Decimal CollectionReconditioningTool {get;set;}
        @AuraEnabled public Decimal EoLContainerTool {get;set;}
    }
    
    public class CompetitorWrapper {
        @AuraEnabled public String ImpactCategory {get;set;}
        @AuraEnabled public String Unit {get;set;}
        @AuraEnabled public Decimal Total {get;set;}
        @AuraEnabled public Decimal RawMaterialsManufacturingTool {get;set;}
        @AuraEnabled public Decimal PackingAccessoryTool {get;set;}
        @AuraEnabled public Decimal DistributionToPackerTool {get;set;}
        @AuraEnabled public Decimal UsePhaseTool {get;set;}
        @AuraEnabled public Decimal CollectionReconditioningTool {get;set;}
        @AuraEnabled public Decimal EoLContainerTool {get;set;}
    }
}