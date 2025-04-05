import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import {
  Facebook,
  Twitter,
  Mail,
  ChefHat,
  ArrowLeft,
  Search,
  Plus,
  X,
  ShoppingCart,
  Mic,
  Camera,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./App.css";

// Use a single API key across the application
const SPOONACULAR_API_KEY = "85230d2e545e4d629299cfa07a206b3f";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/category" element={<CategorySelection />} />
          <Route path="/add/:category" element={<KitchenAssistant />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/recipes" element={<Navigate to="/category" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/welcome");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <ChefHat className="login-icon" />
          <h2>Login to Kitchen Assistant</h2>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <div className="social-login">
          <div className="divider">
            <span>Or continue with</span>
          </div>
          <div className="social-buttons">
            <button className="social-button facebook">
              <Facebook />
            </button>
            <button className="social-button twitter">
              <Twitter />
            </button>
            <button className="social-button email">
              <Mail />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <ChefHat className="welcome-icon" />
        <h1>Welcome to Smart Kitchen Assistant</h1>
        <p>Your personal guide to cooking delicious meals</p>
        <button className="welcome-button" onClick={() => navigate("/category")}>
          Start Cooking
        </button>
      </div>
    </div>
  );
};

const CategorySelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="category-container">
      <div className="category-content">
        <h1>Select Your Cooking Preference</h1>
        <div className="category-grid">
          <button
            className="category-card veg"
            onClick={() => navigate("/add/veg")}
          >
            <div className="category-icon">🥗</div>
            <h2>Vegetarian</h2>
            <p>Discover delicious plant-based recipes</p>
          </button>
          <button
            className="category-card non-veg"
            onClick={() => navigate("/add/non-veg")}
          >
            <div className="category-icon">🍖</div>
            <h2>Non-Vegetarian</h2>
            <p>Explore meat-based recipes</p>
          </button>
        </div>
      </div>
    </div>
  );
};

const KitchenAssistant: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
      } catch (error) {
        console.error("Error loading model:", error);
        toast.error("Failed to load ingredient detection model");
      }
    };
    loadModel();
  }, []);

  const addIngredient = () => {
    if (!newIngredient.trim()) return;
    setIngredients([...ingredients, newIngredient.trim()]);
    setNewIngredient("");
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((item) => item !== ingredient));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !model) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => (img.onload = resolve));

      const predictions = await model.detect(img);
      const detectedIngredients = predictions
        .filter((pred) => pred.score > 0.5)
        .map((pred) => pred.class);

      if (detectedIngredients.length > 0) {
        setIngredients((prev) => [...new Set([...prev, ...detectedIngredients])]);
        toast.success(`Detected: ${detectedIngredients.join(", ")}`);
      } else {
        toast.error("No ingredients detected in the image");
      }

      URL.revokeObjectURL(img.src);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const startListening = () => {
    const recognition = new (window.SpeechRecognition ||
      (window as any).webkitSpeechRecognition)();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIngredients([...ingredients, transcript]);
      toast.success("Added: " + transcript);
    };
    recognition.start();
  };

  const startCameraDetection = async () => {
    if (!model) {
      toast.error("Model not loaded yet");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();

        const detect = async () => {
          if (!videoRef.current) return;
          const predictions = await model.detect(videoRef.current);
          const detected = predictions
            .filter((pred) => pred.score > 0.5)
            .map((pred) => pred.class);
          if (detected.length > 0) {
            setIngredients((prev) => [...new Set([...prev, ...detected])]);
            toast.success(`Detected: ${detected.join(", ")}`);
          }
        };

        const interval = setInterval(detect, 3000);
        return () => {
          clearInterval(interval);
          stream.getTracks().forEach((track) => track.stop());
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera");
    }
  };

  const fetchRecipes = async () => {
    if (ingredients.length === 0) return;
    const query = ingredients.join(",");
    const apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=10&apiKey=${SPOONACULAR_API_KEY}`;

    try {
      setLoading(true);
      const response = await axios.get(apiUrl);
      const recipesWithDetails = await Promise.all(
        response.data.map(async (recipe: any) => {
          const detail = await axios.get(
            `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}`
          );
          return {
            ...recipe,
            vegetarian: detail.data.vegetarian,
            image: detail.data.image,
            missedIngredients: recipe.missedIngredients,
          };
        })
      );
      const filtered =
        category === "veg"
          ? recipesWithDetails.filter((r: any) => r.vegetarian)
          : recipesWithDetails.filter((r: any) => !r.vegetarian);
      setRecipes(filtered);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  };

  const addToShoppingList = (recipe: any) => {
    const missing = recipe.missedIngredients.map((i: any) => i.original);
    const combined = [...shoppingList, ...missing];
    const unique = Array.from(new Set(combined));
    setShoppingList(unique);
    toast.success("Added missing ingredients to shopping list");
  };

  const removeFromShoppingList = (item: string) => {
    setShoppingList(shoppingList.filter((i) => i !== item));
  };

  const openBlinkit = () => {
    const searchQuery = encodeURIComponent(shoppingList.join(", "));
    window.open(`https://blinkit.com/search?query=${searchQuery}`, "_blank");
  };

  return (
    <div className="kitchen-container">
      <button className="back-button" onClick={() => navigate("/category")}>
        <ArrowLeft /> Back
      </button>
      <div className="input-section">
        <div className="ingredient-input">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="Add ingredient"
            onKeyPress={(e) => e.key === "Enter" && addIngredient()}
          />
          <button onClick={addIngredient} className="action-button">
            <Plus />
          </button>
          <button onClick={startListening} className="action-button">
            <Mic />
          </button>
          <button onClick={startCameraDetection} className="action-button">
            <Camera />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="action-button"
          >
            <Upload />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
        {isProcessing && <div className="processing">Processing image...</div>}
      </div>

      <video
        ref={videoRef}
        width="300"
        autoPlay
        muted
        className="camera-preview"
      />

      <div className="ingredients-list">
        {ingredients.map((i, idx) => (
          <span key={idx} className="ingredient-tag">
            {i}{" "}
            <button onClick={() => removeIngredient(i)}>
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      <button
        className="search-button"
        onClick={fetchRecipes}
        disabled={ingredients.length === 0}
      >
        <Search /> Find Recipes
      </button>

      {loading && <div className="loading">Loading recipes...</div>}

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <img src={recipe.image} alt={recipe.title} />
            <h3>{recipe.title}</h3>
            <p>Missing: {recipe.missedIngredients.length}</p>
            <button onClick={() => navigate(`/recipe/${recipe.id}`)}>
              View
            </button>
            <button onClick={() => addToShoppingList(recipe)}>
              <ShoppingCart size={14} /> Add to List
            </button>
          </div>
        ))}
      </div>

      {shoppingList.length > 0 && (
        <div className="shopping-list">
          <h3>Shopping List</h3>
          {shoppingList.map((item, idx) => (
            <div key={idx} className="shopping-item">
              {item}{" "}
              <button onClick={() => removeFromShoppingList(item)}>
                <X size={14} />
              </button>
            </div>
          ))}
          <button onClick={openBlinkit} className="blinkit-button">
            Order on Blinkit
          </button>
        </div>
      )}
    </div>
  );
};

const RecipeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<any>(null);
  const navigate = useNavigate();
  const [isReading, setIsReading] = useState(false);
  const synthesis = window.speechSynthesis;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}`
        );
        setDetails(res.data);
      } catch (error) {
        console.error("Error fetching recipe details:", error);
        toast.error("Failed to load recipe details");
        navigate(-1);
      }
    };
    fetchDetails();

    return () => {
      if (synthesis.speaking) {
        synthesis.cancel();
      }
    };
  }, [id, navigate]);

  const readRecipe = () => {
    if (!details) return;

    if (synthesis.speaking) {
      synthesis.cancel();
      setIsReading(false);
      return;
    }

    setIsReading(true);

    const recipeText = `
      Recipe for ${details.title}.
      This recipe takes ${details.readyInMinutes} minutes to prepare and serves ${details.servings}.
      
      Ingredients needed:
      ${details.extendedIngredients.map((i: any) => i.original).join(". ")}
      
      Instructions:
      ${details.instructions.replace(/<[^>]*>/g, "")}
    `;

    const utterance = new SpeechSynthesisUtterance(recipeText);
    
    utterance.onend = () => {
      setIsReading(false);
    };

    utterance.onerror = () => {
      setIsReading(false);
      toast.error("Error reading recipe");
    };

    synthesis.speak(utterance);
  };

  if (!details) return <div className="loading">Loading...</div>;

  return (
    <div className="recipe-details">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft /> Back
      </button>
      <div className="recipe-header">
        <h1>{details.title}</h1>
        <button 
          onClick={readRecipe}
          className={`read-aloud-button ${isReading ? "reading" : ""}`}
          title={isReading ? "Stop reading" : "Read recipe aloud"}
        >
          {isReading ? <VolumeX /> : <Volume2 />}
        </button>
      </div>
      <img src={details.image} alt={details.title} />
      <p>
        <b>Ready in:</b> {details.readyInMinutes} minutes
      </p>
      <p>
        <b>Servings:</b> {details.servings}
      </p>
      <h3>Ingredients</h3>
      <ul>
        {details.extendedIngredients.map((i: any) => (
          <li key={i.id}>{i.original}</li>
        ))}
      </ul>
      <h3>Instructions</h3>
      <div dangerouslySetInnerHTML={{ __html: details.instructions }} />
    </div>
  );
};

export default App;