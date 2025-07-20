import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { questionService } from "@/services/api/questionService";

const QuestionsManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filter, setFilter] = useState("active"); // "active" or "archived"
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    type: "text",
    options: "",
    logic_json: ""
  });

  const questionTypes = [
    { value: "radio", label: "Radio (Yes/No)" },
    { value: "scale", label: "Scale (1-10)" },
    { value: "text", label: "Text Area" },
    { value: "time", label: "Time" },
    { value: "number", label: "Number" },
    { value: "multi", label: "Multi-select" }
  ];

  const loadQuestions = async () => {
    try {
      setError("");
      setLoading(true);
      const allQuestions = await questionService.getAll();
      setQuestions(allQuestions);
    } catch (err) {
      setError("Failed to load questions");
      console.error("Load questions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.label.trim()) {
      toast.error("Question label is required");
      return;
    }

    try {
      const questionData = {
        label: formData.label.trim(),
        type: formData.type,
        options: formData.options.trim() ? formData.options.split('\n').map(opt => opt.trim()).filter(opt => opt) : null,
        logic_json: formData.logic_json.trim() ? JSON.parse(formData.logic_json) : null
      };

      // Validate question structure
      questionService.validateQuestion(questionData);

      if (editingQuestion) {
        await questionService.update(editingQuestion.Id, questionData);
        toast.success("Question updated successfully");
      } else {
        await questionService.create(questionData);
        toast.success("Question added successfully");
      }

      resetForm();
      loadQuestions();
    } catch (err) {
      if (err.message.includes("JSON")) {
        toast.error("Invalid JSON in logic field");
      } else {
        toast.error(err.message || "Failed to save question");
      }
      console.error("Save question error:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      label: "",
      type: "text",
      options: "",
      logic_json: ""
    });
    setShowForm(false);
    setEditingQuestion(null);
  };

  const handleEdit = (question) => {
    setFormData({
      label: question.label,
      type: question.type,
      options: question.options ? question.options.join('\n') : "",
      logic_json: question.logic_json ? JSON.stringify(question.logic_json, null, 2) : ""
    });
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleArchive = async (question) => {
    try {
      if (question.is_active) {
        await questionService.archive(question.Id);
        toast.success("Question archived successfully");
      } else {
        await questionService.activate(question.Id);
        toast.success("Question activated successfully");
      }
      loadQuestions();
    } catch (err) {
      toast.error("Failed to update question status");
      console.error("Archive/activate error:", err);
    }
  };

  const handleDelete = async (question) => {
    if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return;
    }

    try {
      await questionService.delete(question.Id);
      toast.success("Question deleted successfully");
      loadQuestions();
    } catch (err) {
      if (err.message.includes("existing answers")) {
        toast.error("Cannot delete question with existing answers. Archive it instead.");
      } else {
        toast.error("Failed to delete question");
      }
      console.error("Delete question error:", err);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    try {
      const filteredQuestions = getFilteredQuestions();
      const draggedQuestion = filteredQuestions[draggedIndex];
      const newQuestions = [...filteredQuestions];
      
      // Remove dragged item
      newQuestions.splice(draggedIndex, 1);
      
      // Insert at new position
      const actualDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newQuestions.splice(actualDropIndex, 0, draggedQuestion);
      
      // Update display_order for all questions
      const reorderedQuestions = newQuestions.map((q, index) => ({
        ...q,
        display_order: index + 1
      }));

      await questionService.reorder(reorderedQuestions);
      toast.success("Questions reordered successfully");
      loadQuestions();
    } catch (err) {
      toast.error("Failed to reorder questions");
      console.error("Reorder error:", err);
    }
    
    setDraggedIndex(null);
  };

  const getFilteredQuestions = () => {
    return questions
      .filter(q => filter === "active" ? q.is_active : !q.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadQuestions} />;

  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Questions Management
          </h1>
          <p className="text-gray-600">
            Manage diary questions and configure their display order.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={filter === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("active")}
              className="text-xs"
            >
              <ApperIcon name="Eye" className="w-4 h-4 mr-1" />
              Active
            </Button>
            <Button
              variant={filter === "archived" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("archived")}
              className="text-xs"
            >
              <ApperIcon name="Archive" className="w-4 h-4 mr-1" />
              Archived
            </Button>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-primary-600 to-secondary-600"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Add/Edit Question Form */}
      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display text-gray-900">
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetForm}
            >
              <ApperIcon name="X" className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Question Label"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter the question text"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {questionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {(formData.type === "radio" || formData.type === "multi") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options (one per line)
                  </label>
                  <textarea
                    name="options"
                    value={formData.options}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Yes&#10;No"
                  />
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logic JSON (Optional)
                </label>
                <textarea
                  name="logic_json"
                  value={formData.logic_json}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  placeholder='{"show_if": {"question_id": 8, "operator": ">=", "value": 7}}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  JSON configuration for conditional display logic
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600">
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                {editingQuestion ? "Update Question" : "Add Question"}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold font-display text-gray-900">
            {filter === "active" ? "Active Questions" : "Archived Questions"} ({filteredQuestions.length})
          </h3>
          {filter === "active" && (
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop to reorder questions
            </p>
          )}
        </div>
        
        {filteredQuestions.length === 0 ? (
          <Empty 
            title={filter === "active" ? "No active questions" : "No archived questions"}
            description={filter === "active" ? "Add your first question to get started" : "No questions have been archived yet"}
            icon="HelpCircle"
            actionText={filter === "active" ? "Add Question" : undefined}
            onAction={filter === "active" ? () => setShowForm(true) : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((question, index) => (
              <div
                key={question.Id}
                draggable={filter === "active"}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors ${
                  filter === "active" ? "cursor-move" : ""
                } ${draggedIndex === index ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {filter === "active" && (
                      <div className="flex flex-col items-center text-gray-400">
                        <ApperIcon name="GripVertical" className="w-4 h-4" />
                      </div>
                    )}
                    <div className="bg-primary-100 p-2 rounded-full">
                      <ApperIcon name="HelpCircle" className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {question.label}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {questionTypes.find(t => t.value === question.type)?.label || question.type}
                        </span>
                        {question.logic_json && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Conditional
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Order: {question.display_order}
                        {question.options && ` • Options: ${question.options.length}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(question)}
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(question)}
                      className={question.is_active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                    >
                      <ApperIcon name={question.is_active ? "Archive" : "RotateCcw"} className="w-4 h-4" />
                    </Button>
                    {!question.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(question)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuestionsManagement;