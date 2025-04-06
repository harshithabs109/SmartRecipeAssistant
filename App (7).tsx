// App.tsx

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

const SPOONACULAR_API_KEY = "82fb22897bdf4e42b4f4e977ff3583b1";

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
        <button
          className="welcome-button"
          onClick={() => navigate("/category")}
        >
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
      <a href="https://shiny-elf-c962f9.netlify.app/">
        <img
          id="chatbot"
          src="data:image/png;base64,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"
          style={{
            width: "50px",
            height: "auto",
            borderRadius: "8px",
            margin: "16px",
            display: "block",
            textAlign: "right",
            float: "right",
          }}
        />
      </a>
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        setIngredients((prev) => [
          ...new Set([...prev, ...detectedIngredients]),
        ]);
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
      if (event.target) event.target.value = "";
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
    const searchQuery = encodeURIComponent(shoppingList.join(" "));
    const blinkitSearchUrl = `https://blinkit.com/s/?q=${searchQuery}`;
    window.open(blinkitSearchUrl, "_blank");
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
      if (synthesis.speaking) synthesis.cancel();
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
      This recipe takes ${
        details.readyInMinutes
      } minutes to prepare and serves ${details.servings}.
      Ingredients: ${details.extendedIngredients
        .map((i: any) => i.original)
        .join(". ")}.
      Instructions: ${details.instructions.replace(/<[^>]*>/g, "")}
    `;

    const utterance = new SpeechSynthesisUtterance(recipeText);
    utterance.onend = () => setIsReading(false);
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
