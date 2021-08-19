// @param {startState} object it store the initial values to initiliaze the
// UI state
// Everytime UI state is changed this state is updated so that this can
// preserve the changes in case error happens


// This will also help in migrating the controls from to different
$3Dmol.StateManager = (function(){

  function States(glviewer, config){
    config = config || {};
    config.ui = config.ui || false;
    console.log('State Manager Initiated For the viewer', glviewer);
    console.log('Viewer Configuration', );


    var canvas = $(glviewer.getRenderer().domElement);
    var parentElement = glviewer.container;
    console.log('Container', parentElement, canvas.height(), canvas.width(), parentElement.height(), parentElement.width());
    var height = parentElement.height();
    var width = parentElement.width();
    var offset = canvas.offset();
    var stateManager = this;

    var uiOverlayConfig = {
      height : height,
      width : width,
      offset : offset,
      ui : config.ui || undefined
    }

    // console.log('')
    // Selection Handlers
    var selections = {};

    // Surface handlers
    var surfaces = {};

    // Label Handlers
    var labels = {};

    var atomLabel = {};
    
    this.addSelection = function(spec, sid = null){
      // console.log('Add Selection Called');
      var id = sid || makeid(4);
      var selectionSpec = {
        spec : spec,
        styles : {},
        hidden : false
      }

      if(sid == null)
        selections[id] = selectionSpec;
      else 
        selections[id].spec = selectionSpec.spec;

      console.log("StateManager::addSelection", selections, sid);
      render();
      return id;
    }

    this.checkAtoms = function(sel){
      var atoms = glviewer.selectedAtoms(sel);
      if( atoms.length > 0)
        return true

      return false;
    }

    this.toggleHide = function(sid){
      selections[sid].hidden = !selections[sid].hidden;
      console.log('toggle hide', selections, selections[sid]);
      render();
    }

    this.removeSelection = function(id) {
      delete selections[id];
      render();
    }

    this.addStyle = function( spec, sid, stid = null){
      var selection = selections[sid];
      
      
      var styleSpec = {
        spec : spec,
        hidden : false
      }
      
      var id = null; 
      
      if(stid == null) {
        id = makeid(4);
        selection.styles[id] = styleSpec
      }
      else {
        id = stid;
        selection.styles[id].spec = spec;
      }
      
      console.log("StateManager::addStyle", selections, sid, stid, spec);
      render();

      return id;
    }

    

    this.removeStyle = function(sid, stid){
      console.log(selections, stid, sid)
      delete selections[sid].styles[stid];
      render();
    }

    this.toggleHideStyle = function(sid, stid){
      selections[sid].styles[stid].hidden = !selections[sid].styles[stid].hidden;
      render();
    }

    this.addSurface = function(property){
      var id = makeid(4);
      property.id = id;

      var style = property.surfaceStyle.value;
      if(style == null)
        style = {};

      var sel = selections[property.surfaceFor.value];

      var generatorAtom = (property.surfaceOf.value == 'self')? sel.spec : {};

      console.log('StateManager::addSurface', property, style);

      glviewer.addSurface(
        $3Dmol.SurfaceType[property.surfaceType.value],
        style,
        sel.spec,
        generatorAtom
      ).then((surfId)=>{
        surfaces[id] = surfId;
        console.log("StateManager::Surfaces", surfaces);
      }, (err)=>{
        console.log('It failed', err);
      });

      return id;
    }

    this.removeSurface = function(id){
      
      glviewer.removeSurface(surfaces[id])
      delete surfaces[id];

    }


    this.editSurface = function(surfaceProperty){
      var style = surfaceProperty.surfaceStyle.value || {}
      var sel = selections[surfaceProperty.surfaceFor.value];

      console.log('Surfaces edited', surfaceProperty.id, surfaces, surfaces[surfaceProperty.id]);
      glviewer.removeSurface(surfaces[surfaceProperty.id]);

      glviewer.addSurface(
        $3Dmol.SurfaceType[surfaceProperty.surfaceType.value],
        style,
        sel.spec
      ).then((surfId)=>{
        surfaces[surfaceProperty.id] = surfId;
      });

      console.log('StateManager::editSurface#Updating Surface', surfaceProperty)
    }

    this.getSelectionList = function(){
      console.log(Object.keys(selections))
      return Object.keys(selections);
    }

    this.openContextMenu = function(atom, x, y){
      console.log('Open Context Menu', atom, x, y);  
      var atomExist = false;

      if(atom){
        atomExist = Object.keys(atomLabel).find((i)=>{
          if (i == atom.index)
            return true;
          else 
            return false;
        });
  
        if(atomExist != undefined )
          atomExist = true;
        else 
          atomExist = false;
        
      }

      this.ui.tools.contextMenu.show(x, y, atom, atomExist);    
    }

    this.addLabel = function(labelValue){
      console.log('Label Added', labelValue);
      labels[labelValue.sel.value] = labels[labelValue.sel.value] || [];

      var labelProp = $3Dmol.labelStyles[labelValue.style.value];
      var selection = selections[labelValue.sel.value];

      var offset = labels[labelValue.sel.value].length;
      labelProp['screenOffset'] = new $3Dmol.Vector2(0, -1*offset*35);

      labels[labelValue.sel.value].push(glviewer.addLabel(labelValue.text.value, labelProp, selection.spec));

      this.ui.tools.contextMenu.hide();
    }

    this.addAtomLabel = function(labelValue, atom){
      var atomExist = Object.keys(atomLabel).find((i)=>{
        if (i == atom.index)
          return true;
        else 
          return false;
      });

      if(atomExist != undefined )
        atomExist = true;
      else 
        atomExist = false;


      if(atomExist){
        this.removeAtomLabel(atom);
      }

      console.log('Add Atom Label Value', labelValue);
      
      atomLabel[atom.index] = atomLabel[atom.index] || null;
      
      var labelProp = $3Dmol.deepCopy($3Dmol.labelStyles['milk']);
      labelProp.position = {
        x : atom.x, y : atom.y, z : atom.z
      }

      var labelText = [];
      for ( key in labelValue){
        labelText.push(`${key} : ${labelValue[key]}`);
      }
      labelText = labelText.join('\n');

      atomLabel[atom.index] = glviewer.addLabel(labelText, labelProp);
      
      console.log('Getting Atom Label', labelText, labelProp);
    }

    this.exitContextMenu = function(processContextMenu = false){
      console.log('Unfinished Labeling');
      this.ui.tools.contextMenu.hide(processContextMenu);
    }

    this.removeLabel = function(){
      // Add code to remove label 
      console.log('Remove Label')
      this.ui.tools.contextMenu.hide();
    }

    this.removeAtomLabel = function(atom){
      var label = atomLabel[atom.index];
      console.log("Stuff", label, atomLabel);
      glviewer.removeLabel(label);
      delete atomLabel[atom.index]; 
      
      console.log("Stuff After removal", label, atomLabel);
      this.ui.tools.contextMenu.hide();
    }

    this.addModel = function(modelDesc){
      glviewer.removeAllModels();
      glviewer.removeAllSurfaces();
      glviewer.removeAllLabels();
      glviewer.removeAllShapes();

      var query = modelDesc.urlType.value + ':' + modelDesc.url.value;
      $3Dmol.download(query, glviewer, {}, ()=>{
        this.ui.tools.modelToolBar.setModel(modelDesc.url.value.toUpperCase());
      });

      // Remove all Selections
      selections = {};
      surfaces = {};
      atomLabel = {};
      labels = {};

      // Reset UI
      this.ui.tools.selectionBox.empty();
      this.ui.tools.surfaceMenu.empty();
    }

    // State Management helper function 
    function findSelectionBySpec(spec){
      var ids = Object.keys(selections);
      var matchingObjectIds = null;
      for(var i = 0; i < ids.length; i++){
        var lookSelection = selections[ids[i]].spec;

        var match = true;
        
        // looking for same parameters length 
        var parameters = Object.keys(spec);
        if( Object.keys(lookSelection).length == parameters.length){
          for(var j = 0; j < parameters.length; j++){
            if( lookSelection[parameters[j]] != spec[parameters[j]]){
              match = false;
              break;
            }
          }
        }

        if(match){
          matchingObjectIds = ids[i];
          break;
        }
      }

      return matchingObjectIds;
    }

    // State managment function 
    this.createSelectionAndStyle = function(selSpec, styleSpec){

      var selId = findSelectionBySpec(selSpec);
      if(selId == null){
        selId = this.addSelection(selSpec);
        
      }
      var styleId = this.addStyle(styleSpec, selId);

      console.log('StateManager::Creating Selection and Style', selId, styleId, selections);

      // creating selection and style 
      this.ui.tools.selectionBox.editSelection(selId, selSpec, styleId, styleSpec);
    };

    this.createSurface = function(surfaceType, sel, style){
      var selId = findSelectionBySpec(sel);
      
      if(selId == null){
        selId = this.addSelection(selSpec);

        // Create UI for selection 
      }

      var surfaceInput = {
        surfaceType : {
          value : surfaceType
        },

        surfaceStyle : {
          value : style,
        },

        surfaceOf : {
          value : 'self'
        },

        surfaceFor : {
          value : selId
        }
      }

      var surfId = this.addSurface(surfaceInput)

      console.log('StateManager::Creating Surface', surfId, selId, surfaces);
      // Create Surface UI
    };

    canvas.on('click', ()=>{
      if(this.ui.tools.contextMenu.hidden == false){
        this.ui.tools.contextMenu.hide();
      }
    });
    
    // Setting up UI generation 
    this.showUI = function(){
      var ui = new $3Dmol.UI(this, uiOverlayConfig, parentElement);  
      return ui;
    };

    if(config.ui == true){
     this.ui = this.showUI(); 
    };

    this.updateUI = function(){
      if(this.ui){
        this.ui.resize();
      }
    };
    
    // UI changes

    // console.log('GetSelectionList', this.getSelectionList());

    function render(){
      console.log('RENDER::', selections);
      // glviewer.();
      glviewer.setStyle({});

      let selList = Object.keys(selections);

      selList.forEach( (selKey) =>{
        var sel = selections[selKey];

        if( !sel.hidden ) {
          var styleList = Object.keys(sel.styles);
          
          styleList.forEach((styleKey)=>{
            var style = sel.styles[styleKey];

            if( !style.hidden){
              glviewer.addStyle(sel.spec, style.spec);
            }
          });

          glviewer.setClickable(sel.spec, true, ()=>{});
          glviewer.enableContextMenu(sel.spec, true);
        }
        else {
          glviewer.setClickable(sel.spec, false, ()=>{});
          glviewer.enableContextMenu(sel.spec, false);
        }

      })

      glviewer.render();
    }

    function clear(selectionSpec){
      glviewer.enableContextMenu(sel.spec, false);
      glviewer.setStyle(selectionSpec.spec, {});
    }

    function makeid(length) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
    }
  }

  return States;
})()
