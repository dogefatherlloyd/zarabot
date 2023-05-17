import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';  // Add this line
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gwsmfmqtmuhmglnfzqma.supabase.co";
const supabaseKey = "your_supabase_key";
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchDataFromSupabase() {
  const { data, error } = await supabase
    .from('stock_data')
    .select('*');
  
  if (error) {
    console.error('Error fetching data:', error);
  } else {
    return data;
  }
}

async function saveModelData(modelData) {
  const { data, error } = await supabase
    .from('model_data')
    .insert(modelData);
  
  if (error) {
    console.error('Error saving model data:', error);
  } else {
    console.log('Saved model data:', data);
  }
}

async function trainModel(inputs, labels) {
  // Create the model
  const model = createModel();  
  model.summary();

  // Train the model  
  await train(model, inputs, labels);

  // Save the model for later use
  const modelData = model.toJSON();
  await saveModelData(modelData);

  return model;
}

function createModel() {
  // Create a sequential model
  const model = tf.sequential(); 

  // Add a single hidden layer
  model.add(tf.layers.dense({inputShape: [10], units: 50, useBias: true}));

  // Add an output layer
  model.add(tf.layers.dense({units: 1, useBias: true}));

  return model;
}

async function train(model, inputs, labels) {
  // Prepare the model for training.  
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['mse'],
  });
  
  const batchSize = 32;
  const epochs = 50;

  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss', 'mse'], 
      { height: 200, callbacks: ['onEpochEnd'] }
    )
  });
}

// Function to convert your data into tensors
function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any 
  // intermediate tensors.

  return tf.tidy(() => {
    // Step 1. Shuffle the data    
    tf.util.shuffle(data);
    // Step 2. Convert data to Tensor
    const inputs = data.map(d => d.x)
    const labels = data.map(d => d.y);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
    const labelTensor = tf.tensor2d(labels, [labels.length, labels[0].length]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();  
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    }
  }); 
}

// This is where you should call the trainModel function
async function run() {
  // Load and normalize the data
  const data = await fetchDataFromSupabase();
  const tensorData = convertToTensor(data);
  const {inputs, labels} = tensorData;

  // Train the model
  await trainModel(inputs, labels);
}

run().then(() => {
  console.log("Model training complete");
  // Here you could add any code that you want to run after training is complete.
  // For instance, you might want to save the model, evaluate it, or make predictions.
}).catch((error) => {
  console.error("Error during model training:", error);
});