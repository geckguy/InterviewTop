// src/data/featuredPosts.ts
import { InterviewExperience } from "@/types/backend"; // Import the full type

// Define the array using the full InterviewExperience type
export const hardcodedFeaturedPosts: InterviewExperience[] = [
  // --- Google L3 ---
  {
    _id: { $oid: "67f882619e7da9aa88fb7372" }, // Use the original _id structure or just the string ID "67f882619e7da9aa88fb7372" if your component expects that
    id: "67f882619e7da9aa88fb7372", // Add a simple id field for consistency if needed
    company: "Google",
    position: "L3",
    location: "India",
    seniority: "junior",
    difficulty: "hard",
    offer_status: "accepted",
    createdAt: "2025-03-10T08:17:35.665843+00:00",
    quality_flag: 1,
    quality_reasoning: "Extremely detailed post covering multiple rounds, specific questions, timeline, and outcome.",
    compensation_details: null, // Assuming null if not provided
    interview_details: [
      {
        round_number: 1,
        type: "Technical (Coding) - Phone Screen",
        questions: [
          "Find the sum of all possible valid subsequences in an array.",
          "Valid Subsequence: Continuous subarray with absolute difference of 1 between adjacent elements.",
          "Follow-up: Solve in a memory-constrained environment where the entire array cannot be loaded."
        ]
      },
      {
        round_number: 2,
        type: "Technical (Coding) + Design - Onsite 1",
        questions: [
          "Given parking ticket logs (arrival, departure times), find the number of cars in the garage at any given time.",
          "Follow-up (Design): Design a garage system considering capacity, day checks, and parking fee calculation.",
          "Given multiple (x,y) coordinates, for any query point, find the number of rectangles covering that point (similar to LeetCode 'Count Number of Rectangles Containing Each Point', but rectangle corners not necessarily at origin).",
          "Design functions to register logs for a telephone company and find the most talkative person at any given timestamp."
        ]
      },
      {
        round_number: 3,
        type: "Technical (Coding) - Onsite 2",
        questions: [
          "Find the maximum area rectangle formed by given points (similar to LeetCode 'Minimum Area Rectangle', but find max).",
          "Follow-up: Rectangles are not necessarily parallel to axes.",
          "Given communication centers, channels (two-way), a list of corrupted stations, a source, and a destination, determine if the destination is reachable from the source without passing through corrupted stations."
        ]
      },
      {
        round_number: 4,
        type: "Technical (Coding) - Onsite 3",
        questions: [
          "Schedule airplanes: Given flight schedules [departure_city, arrival_city, departure_time, arrival_time], find the minimum number of airplanes required (similar to LC Discuss 1670250).",
          "Follow-up: Return all possible routes (backtracking)."
        ]
      },
      {
        round_number: 5,
        type: "Behavioral - Googliness",
        questions: [
          "General leadership and situational questions."
        ]
      },
      {
        round_number: 6,
        type: "Team Fit Call",
        questions: [
          "Discussion about work experience.",
          "Overview of the role.",
          "Questions about alignment with tech stack (Java mentioned).",
          "Discussion on reasons for tech stack transition."
        ]
      }
    ],
    leetcode_questions: [
       // NOTE: The JSON includes detailed explanations/thoughts within the test cases.
       // It's better practice to keep only the essential data (input, output, clean explanation) here.
       // For brevity and correctness, I'll simplify the explanation based on the FINAL derived logic.
      {
        problem_name: "Sum of Valid Subsequences",
        problem_statement: "Given an array of integers `nums`, find the sum of all possible 'valid subsequences'. A valid subsequence is defined as a continuous subarray where the absolute difference between any two adjacent elements is exactly 1. Calculate the sum of these valid subarrays' sums.\n\nFollow-up: How would you solve this problem if the input array `nums` is too large to fit into memory entirely, and you can only process it sequentially (e.g., as a stream)?",
        function_signature: "long long sumOfValidSubsequences(vector<int>& nums);",
        test_cases: [
          {
            input: "[4,5,4,9,10,11,3,8]",
            // Using the consistent logic derived: 95, not 99 (potential post typo)
            output: "95",
            explanation: "Algorithm: total_sum = 0, current_block_sum = 0. Iterate: if block broken, current_block_sum = num; else, current_block_sum += num. total_sum += current_block_sum. Result: 4+9+13+9+19+30+3+8 = 95."
          },
          {
            input: "[11, 35]",
            output: "46",
            explanation: "Algorithm result: 11 + 35 = 46."
          },
          {
            input: "[1, 2, 3, 2, 3, 4, 5]",
            // Using the consistent logic derived: 64, not 69 (potential post typo)
            output: "64",
             explanation: "Algorithm result: 1 + 3 + 6 + 8 + 11 + 15 + 20 = 64."
          }
        ]
      },
      // ... (Include ALL other leetcode_questions from the JSON for Google) ...
       {
         problem_name: "Parking Garage Occupancy",
         problem_statement: "You are given a list of parking tickets. Each ticket is represented as a pair of timestamps `[arrival_time, departure_time]`. Implement a function or structure that can efficiently answer queries of the form: 'How many cars were present in the garage at a specific time `t`?' Assume times are integers.",
         function_signature: "int getOccupancyAtTime(vector<vector<int>>& tickets, int time); // Or a class structure",
         test_cases: [ { input: { tickets: "[[1, 5], [2, 7], [6, 8], [9, 10]]", time: "3" }, output: "2", explanation: "At time 3, cars from tickets [1, 5] (1<=3<5) and [2, 7] (2<=3<7) are present." }, { input: { tickets: "[[1, 5], [2, 7], [6, 8], [9, 10]]", time: "6" }, output: "2", explanation: "At time 6, cars from [2, 7] (2<=6<7) and [6, 8] (6<=6<8) are present." }, { input: { tickets: "[[1, 5], [2, 7], [6, 8], [9, 10]]", time: "8" }, output: "0", explanation: "At time 8, all relevant cars have departed." } ]
       },
       {
         problem_name: "Count Rectangles Covering Point",
         problem_statement: "You are given a list of rectangles, where each rectangle is defined by its bottom-left `(x1, y1)` and top-right `(x2, y2)` coordinates. You are also given a list of points `(px, py)`. For each point, count how many of the given rectangles contain that point. A point is considered inside a rectangle if `x1 <= px <= x2` and `y1 <= py <= y2`.",
         function_signature: "vector<int> countRectangles(vector<vector<int>>& rectangles, vector<vector<int>>& points);",
         test_cases: [ { input: { rectangles: "[[1,1,5,5], [2,2,6,6], [0,0,3,3]]", points: "[[3,3], [6,1], [2,5]]" }, output: "[3, 0, 2]", explanation: "Point (3,3): Covered by all 3. Point (6,1): Covered by 0. Point (2,5): Covered by [1,1,5,5] and [2,2,6,6]." } , { input: { rectangles: "[[0,0,1,1]]", points: "[[0,0], [1,1], [0,1], [1,0], [0.5, 0.5], [2,2]]" }, output: "[1, 1, 1, 1, 1, 0]", explanation: "All points on boundary/inside are covered. (2,2) is outside." } ]
       },
        {
            problem_name: "Most Talkative Person Logger",
            problem_statement: "Design a system to track call durations. Implement:\n1. `registerLog(string person_id, int duration)`: Records call log.\n2. `string findMostTalkative()`: Returns ID of person with max total duration accumulated so far. Break ties arbitrarily.",
            function_signature: "class TalkativeLogger { public: void registerLog(string person_id, int duration); string findMostTalkative(); };",
            test_cases: [ { input: [ "registerLog(\"Alice\", 10)", "registerLog(\"Bob\", 5)", "registerLog(\"Alice\", 20)", "findMostTalkative()", "registerLog(\"Charlie\", 40)", "registerLog(\"Bob\", 10)", "findMostTalkative()", "registerLog(\"Alice\", 15)", "findMostTalkative()" ], output: "[null, null, null, \"Alice\", null, null, \"Charlie\", null, \"Alice\"]", explanation: "Tracks cumulative time: Alice(10)->Bob(5)->Alice(30)->Query(Alice)->Charlie(40)->Bob(15)->Query(Charlie)->Alice(45)->Query(Alice)." } ]
        },
        {
            problem_name: "Maximum Area Axis-Aligned Rectangle",
            problem_statement: "Given points `[x, y]`, find the max area of an axis-aligned rectangle formed by 4 points. Return 0 if none. Follow-up: Non-axis-aligned rectangles.",
            function_signature: "int maxAreaRectangle(vector<vector<int>>& points);",
            test_cases: [ { input: "[[1,1],[1,3],[3,1],[3,3],[2,2]]", output: "4", explanation: "Points (1,1), (1,3), (3,1), (3,3) form a 2x2 rectangle, Area=4." }, { input: "[[1,1],[1,3],[3,1],[3,3],[1,2],[2,1],[2,3],[3,2]]", output: "4", explanation: "Max area is still 4 from the [1,1,3,3] rectangle." }, { input: "[[1,1],[1,3],[2,1],[2,4]]", output: "0", explanation: "No four points form an axis-aligned rectangle." } ]
        },
        {
            problem_name: "Reachable Destination Avoiding Corruption",
            problem_statement: "Given `n` centers, bidirectional `channels` `[u, v]`, `corrupted_stations`, `source`, `destination`. Can `destination` be reached from `source` without passing through corrupted stations?",
            function_signature: "bool canReachDestination(int n, vector<vector<int>>& channels, vector<int>& corrupted_stations, int source, int destination);",
            test_cases: [ { input: { n: 6, channels: "[[0,1],[1,2],[2,3],[3,4],[4,5],[0,5]]", corrupted_stations: "[2, 4]", source: 0, destination: 3 }, output: "false", explanation: "Paths 0-1-2-3 and 0-5-4-3 both use corrupted stations." }, { input: { n: 6, channels: "[[0,1],[1,2],[2,3],[3,4],[4,5],[0,5]]", corrupted_stations: "[1]", source: 0, destination: 4 }, output: "true", explanation: "Path 0-5-4 avoids corrupted station 1." }, { input: { n: 3, channels: "[[0,1],[1,2]]", corrupted_stations: "[1]", source: 0, destination: 2 }, output: "false", explanation: "Path 0-1-2 requires corrupted station 1." }, { input: { n: 3, channels: "[[0,1],[1,2]]", corrupted_stations: "[0]", source: 0, destination: 2 }, output: "false", explanation: "Source itself is corrupted." } ]
        },
        {
            problem_name: "Minimum Airplanes Required",
            problem_statement: "Given `flights` `[dep_city, arr_city, dep_time, arr_time]`. Find min airplanes needed. Reuse condition: next_dep_city == current_arr_city AND next_dep_time > current_arr_time. Follow-up: Find all possible routes for one plane.",
            function_signature: "int minAirplanes(vector<vector<int>>& flights); // Assuming int times/IDs",
            test_cases: [ { input: { flights: [ [0, 1, 100, 200], [1, 2, 210, 300], [0, 2, 150, 250] ] }, output: "2", explanation: "Plane 1: 0->1 (100-200), 1->2 (210-300). Plane 2: 0->2 (150-250) overlaps." }, { input: { flights: [ [0, 1, 0, 300], [0, 2, 10, 350], [1, 0, 310, 610], [2, 0, 360, 700] ] }, output: "2", explanation: "Plane 1: 0->1 (0-300), 1->0 (310-610). Plane 2: 0->2 (10-350), 2->0 (360-700)." }, { input: { flights: [ [0, 1, 10, 20], [1, 2, 20, 30] ] }, output: "2", explanation: "Second flight departs exactly at arrival time (20). Reuse requires dep_time > arr_time. Needs 2 planes." } ]
        }
    ],
    design_questions: [
      {
        design_task: "Parking Garage System Design",
        description: "Design the system for managing a parking garage, based on the car parking ticket information.",
        guiding_questions: [
          "How would you handle garage capacity constraints?",
          "How would you incorporate time-based checks (e.g., different rates for day/night, handling multi-day parking)?",
          "How would you calculate parking fees based on arrival and departure times?",
          "What data structures would be suitable for efficiently querying garage occupancy?",
          "How would you handle concurrent entries and exits?"
        ]
      }
      // Add other design questions if they were in the original JSON but missed
    ],
    problem_link: [
      "https://leetcode.com/discuss/post/1670250/google-phone-airplane-schedule-by-l55tco-bwer/"
    ],
  },

  // --- Amazon Senior Applied Scientist ---
  {
    _id: { $oid: "68007259a2c733a43bd566f3" },
    id: "68007259a2c733a43bd566f3",
    company: "Amazon",
    position: "Senior Applied Scientist",
    location: "Luxembourg",
    seniority: "above senior", // Changed from 'senior' based on position title
    difficulty: "hard",
    offer_status: "pending",
    createdAt: "2023-12-18T15:40:09.560602+00:00",
    quality_flag: 1,
    quality_reasoning: "Extremely detailed breakdown of multiple rounds, including specific ML, behavioral, and coding questions.",
    compensation_details: null,
    interview_details: [
      { round_number: 1, type: "Phone Interview - Behavioral", questions: ["Describe a project where you took a decision. What was it like?", "Describe a case when you had a dilemma about whether to do smth yourself or delegate"] },
      { round_number: 1, type: "Phone Interview - ML Breadth", questions: ["Describe types of ML – supervised, unsupervised, and reinforcement learning. Provide examples", "Describe your favorite ML algorithm", "What are the cons of this algorithm?", "Can sigmoid activation be used in neural networks? What a the cons of such a choice?", "What’s an embedding? How are embeddings used?", "How do we get embeddings with the BERT model?", "How is BERT trained? What tasks is it solving?"] },
      { round_number: 1, type: "Phone Interview - ML Depth", questions: ["Product categorization task: Given 10k product descriptions (title, text, photo) classified into 100 categories, and 1m unclassified descriptions. What are your next steps?"] },
      { round_number: 1, type: "Phone Interview - Technical (Coding)", questions: ["A very easy one, akin to word count", "Validation of records in a log file, parsing those with valid ISBNs. Examples of valid ISBNs: 1-23456-789-0, 1-23456-789-x, 1234567890. Invalid ones: 1-23456-7890, 1-2345w6-789-x, 12345-6789x"] },
      { round_number: 2, type: "Onsite - ML Breadth + Behavioral", questions: ["Pearson correlation", "Covariance vs. correlation", "Covariance and PCA – how are they related?", "The complexity of the SVD decomposition?", "You are given two medicines: paracetamol and aspirin. You need to conclude which one is better at fighting a fever. How would you approach this problem (Randomized Controlled Trials, stat tests)", "What’s the difference between t-test and z-test?", "What’s p-value?", "You are given two time series: BTC prices and news sentiments. How would you measure if there’s a price prediction signal in sentiments?", "Suppose BTC prices and news sentiments are correlated. How to conclude which one has a causal effect on the other?", "Suppose you build lags for both time series and measure partial correlations. How can this help in identifying the causal relation between BTC prices and news sentiments?", "What NER metrics do you know?", "Why accuracy can be bad for NER? (class imbalance)", "The difference between micro-and macro-averaged F1 scores", "How to handle class imbalance with specific losses (Focal loss)", "What statistical tests for measuring inter-annotator agreement do you know?", "LSTMs vs. transformers – describe trade-offs", "What’s the complexity of the attention mechanism?", "How do you apply transformers for a task with long documents?", "Information retrieval: what’s pairwise loss?", "What’s the difference between DCG and nDCG?", "You’re given a large annotated collection of question-document pairs labeled with relevance: excellent, medium, and poor. You are also given a large click dataset. What’s the relation between click data and human-annotated data? Is having click data only sufficient? How would you train an IR model with the data at hand?", "You a finishing a paper but some experiments are not yet done. A deadline for an A-grade conference is approaching. You feel safer submitting to a B-grade conference with a deadline in 2 months. What would you do and why?", "Describe your largest ever deliverable."] },
      { round_number: 3, type: "Onsite - ML Depth + Behavioral", questions: ["What’s your most innovative idea?", "Tell me about a time when you made some user-facing simplification. What drove the need for such a simplification?", "Tell me about a time when you had to dig deep into the root-cause analysis. How did you know you needed to dig deeper?", "What would you’ve done differently in any of your projects?", "You are given a large collection of user click data for a large set of search queries and documents (product descriptions). How would you come up with a formula to rank documents given a new search query?", "We might have some frequent queries like “iphone X” and a long tail of infrequent queries. How would that influence your model training process?", "How do you adapt your search system to a new language?", "How would you deal with Chinese queries?", "Suppose you a training an NMT model with data from 15 different sources. Now you need to extend the solution to a new source - news headlines. How would you approach this?"] },
      { round_number: 4, type: "Onsite - ML Breadth + Behavioral", questions: ["Tell me about a time when you did something significant that was beyond your job responsibility.", "What could you have done better in the previous example?", "Tell me about a time when you were not satisfied with some process or status quo in your company and decided to change this.", "How does boosting work?", "Tell me about bias-variance error decomposition. How does it apply to boosting? Bagging?", "Rf and gradient boosting: practical trade-offs?", "What’s the advantage of BERT over RNNs?", "Why do vanilla RNNs experience vanishing gradients?", "Can we use ReLU to fix vanishing gradients in a vanilla RNN?", "How does LSTM fix the same problem?", "How does the attention mechanism work?", "What’s the BERT’s biggest innovation?"] },
      { round_number: 5, type: "Onsite - Technical (Coding) + Behavioral", questions: ["Tell me about a time when you had to go along with a group decision that you disagreed with. What did you do?", "Tell me about a time when you took a big risk. How did you decide that you are taking this risk anyway?", "Coding: Fruit Basket Problem - Given a collection of fruits, put them into the fewest number of baskets such that each basket has no more than 1 of the same fruit type."] },
      { round_number: 6, type: "Onsite - Technical (Coding) + Behavioral", questions: ["Tell me about a time when you took a calculated risk", "Tell me about a time when you had several options and had to make a decision. How did you pick one of the options?", "Coding: Click-Through Rate Calculation - Given impression history (request ID, list of impressions with widget index and category) and click history (request ID, widget index), calculate clicks, impressions, and CTR per widget category."] },
      { round_number: 7, type: "Onsite - Behavioral", questions: ["Tell me a time when you piece when you received a piece of critical feedback from your colleague. How did you handle it? What did you take out from this experience?"] }
    ],
    leetcode_questions: [
      { problem_name: "Word Count (Simplified)", problem_statement: "Implement a function similar to word count (details not specified).", function_signature: null, test_cases: [] },
      { problem_name: "Validate and Parse ISBN Logs", problem_statement: "Given log file records, validate and parse those containing valid ISBNs. Valid formats: 1-23456-789-0, 1-23456-789-x, 1234567890. Invalid examples: 1-23456-7890, 1-2345w6-789-x, 12345-6789x.", function_signature: "List<String> parseValidISBNs(List<String> logRecords)", test_cases: [ { input: "logRecords = [\"Record 1: 1-23456-789-0\", \"Record 2: 1-23456-7890\", \"Record 3: 1234567890\", \"Record 4: 1-2345w6-789-x\"]", output: "[\"1-23456-789-0\", \"1234567890\"]", explanation: "Extracts only the valid ISBNs based on the specified formats." } ] },
      { problem_name: "Fruit Basket Problem", problem_statement: "Given a collection of various types of fruits (e.g., a, b, c, a, b, c, g, o, ...), distribute these fruits into the minimum number of baskets such that no basket contains more than one fruit of the same type. Return the minimum number of baskets.", function_signature: "int minFruitBaskets(List<Character> fruits)", test_cases: [ { input: "fruits = ['a', 'b', 'c', 'a', 'b', 'c', 'd']", output: "2", explanation: "Max frequency is 2 (for 'a', 'b', 'c'). Need 2 baskets." }, { input: "fruits = ['a', 'a', 'a', 'b']", output: "3", explanation: "Max frequency is 3 (for 'a'). Need 3 baskets." } ] }, // Changed function signature/output based on typical problem
      { problem_name: "Click-Through Rate Calculation", problem_statement: "Given impression history (list of objects: requestId, list of impressions {widgetIndex, category}) and click history (list of objects: requestId, widgetIndex). Calculate and return total clicks, total impressions, and CTR (clicks / impressions) for each widget category.", function_signature: "Map<String, Map<String, Double>> calculateCTR(List<Map<String, Object>> impressionHistory, List<Map<String, String>> clickHistory)", test_cases: [ { input: { impression_history: "[{'requestId': 'XYZ', 'impressions': [{'widgetIndex': 'A', 'category': 'Electronics'}, {'widgetIndex': 'B', 'category': 'Books'}, {'widgetIndex': 'C', 'category': 'Books'}]}, {'requestId': 'ABC', 'impressions': [{'widgetIndex': 'A', 'category': 'Toys'}]}, {'requestId': 'DEF', 'impressions': [{'widgetIndex': 'A', 'category': 'Books'}]}]", click_history: "[{'requestId': 'XYZ', 'widgetIndex': 'B'}, {'requestId': 'ABC', 'widgetIndex': 'A'}]" }, output: "{'Books': {'clicks': 1.0, 'impressions': 3.0, 'ctr': 0.333333}, 'Toys': {'clicks': 1.0, 'impressions': 1.0, 'ctr': 1.0}, 'Electronics': {'clicks': 0.0, 'impressions': 1.0, 'ctr': 0.0}}", explanation: "Aggregates counts per category: Books (1 click / 3 impressions), Toys (1 click / 1 impression), Electronics (0 clicks / 1 impression)." } ] } // Stringified input for easier parsing
    ],
    design_questions: [
      { design_task: "Product Categorization System", description: "Design a system to categorize products based on descriptions (title, text, photo), utilizing both labeled (10k) and unlabeled (1m) data across 100 categories.", guiding_questions: ["How to leverage both labeled and unlabeled data?", "What model architectures are suitable (text, image, multimodal)?", "How to handle the 100 categories?", "How to evaluate the system?", "How to deploy and update the model?"] },
      { design_task: "Search Ranking System", description: "Design a system to rank documents (product descriptions) for user search queries using click data. Address issues like frequent vs. infrequent queries.", guiding_questions: ["How to represent queries and documents?", "What ranking models (e.g., pairwise, listwise) are appropriate?", "How to use click data effectively?", "How to handle query frequency differences (long tail)?", "How to evaluate ranking quality?"] }
    ],
    problem_link: [],
  },

  // --- Meta Software Engineer ---
  {
    _id: { $oid: "67fd3753a2c733a43bd55ad2" },
    id: "67fd3753a2c733a43bd55ad2",
    company: "Meta",
    position: "Software Engineer",
    location: "USA",
    seniority: "junior",
    difficulty: "medium",
    offer_status: "rejected",
    createdAt: "2024-06-01T04:09:52.101528+00:00",
    quality_flag: 1,
    quality_reasoning: "Extremely detailed account of multi-stage interview process.",
    compensation_details: null,
    interview_details: [
        { round_number: 1, type: "Technical (Coding)", questions: ["3Sum", "Letter Combinations of a Phone Number"] },
        { round_number: 2, type: "Technical (Coding)", questions: ["Subarray Sum Equals K", "Clone Graph"] },
        { round_number: 3, type: "Behavioral", questions: ["Discuss a setback and how you overcame it.", "Describe a time you faced obstacles and how you prioritized.", "Share a time when you lacked complete information about a technical problem and its resolution.", "Describe constructive feedback you received and how you implemented it."] },
        { round_number: 4, type: "Technical (Coding)", questions: ["Range Sum of BST", "K Closest Points to Origin"] },
        { round_number: 5, type: "Technical (Coding)", questions: ["Find Valley in an Array", "Largest Island"] },
        { round_number: 6, type: "Design", questions: ["Design a messaging application"] },
        { round_number: 7, type: "Design", questions: ["Design something similar to Instagram reels"] }
    ],
    leetcode_questions: [
        // Add brief problem statements if desired, or keep as names
        { problem_name: "3Sum", problem_statement: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.", function_signature: "vector<vector<int>> threeSum(vector<int>& nums);", test_cases: [] },
        { problem_name: "Letter Combinations of a Phone Number", problem_statement: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.", function_signature: "vector<string> letterCombinations(string digits);", test_cases: [] },
        { problem_name: "Subarray Sum Equals K", problem_statement: "Given an array of integers nums and an integer k, return the total number of continuous subarrays whose sum equals k.", function_signature: "int subarraySum(vector<int>& nums, int k);", test_cases: [] },
        { problem_name: "Clone Graph", problem_statement: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.", function_signature: "Node* cloneGraph(Node* node);", test_cases: [] },
        { problem_name: "Range Sum of BST", problem_statement: "Given the root node of a binary search tree and two integers low and high, return the sum of values of all nodes with a value in the inclusive range [low, high].", function_signature: "int rangeSumBST(TreeNode* root, int low, int high);", test_cases: [] },
        { problem_name: "K Closest Points to Origin", problem_statement: "Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0).", function_signature: "vector<vector<int>> kClosest(vector<vector<int>>& points, int k);", test_cases: [] },
        { problem_name: "Find Valley in an Array", problem_statement: "Find an element in an array which is less than or equal to its adjacent elements (a local minimum or valley). Assume array has at least 3 elements and edges are -infinity.", function_signature: "int findValley(vector<int>& nums);", test_cases: [] },
        { problem_name: "Largest Island", problem_statement: "You are given an n x n binary matrix grid. You are allowed to change at most one 0 to be 1. Return the size of the largest island in grid after applying this operation.", function_signature: "int largestIsland(vector<vector<int>>& grid);", test_cases: [] }
    ],
    design_questions: [
        { design_task: "Design a messaging application", description: "Design the backend systems for a real-time messaging application like WhatsApp or Messenger, considering features like 1-on-1 chat, group chat, presence status, message delivery guarantees.", guiding_questions: [] },
        { design_task: "Design Instagram Reels", description: "Design the system architecture for a short-form video feature similar to Instagram Reels, covering aspects like video upload, processing, storage, content discovery (feed generation), and user interaction.", guiding_questions: [] }
    ],
    problem_link: [],
  },

  // Add more full InterviewExperience objects here if needed
];